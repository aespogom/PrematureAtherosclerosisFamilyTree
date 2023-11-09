import { Component, Input, OnInit, SimpleChanges, OnDestroy } from '@angular/core';
import { Patient } from 'src/app/models/patient.model';
import FamilyTree from "src/assets/balkanapp/familytree";
import { Tree } from 'src/app/models/tree.model';
import { Icons } from 'src/app/models/icons.model';
import { CastorAPIService } from 'src/app/services/castor-api.service';
import { Study } from 'src/app/models/study.model';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from './dialog/dialog.component';
import { Answer } from 'src/app/models/answer.model';
import { SpinnerService } from 'src/app/services/spinner.service';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-tree-view',
  templateUrl: './tree-view.component.html',
  styleUrls: ['./tree-view.component.scss']
})
export class TreeViewComponent implements OnInit, OnDestroy {
  @Input() patient: Patient;
  @Input() patients: Array<Patient>;
  original_patient: Patient;
  @Input() study: Study;
  @Input() form:  Map<string, string>;

  chartBase: Array<Tree>;

  constructor(private service:CastorAPIService,
              public dialog: MatDialog,
              private spinner: SpinnerService,
              public translateService: TranslateService) { }

  ngOnInit(): void {
    // Load tree configuration
    this.setTreeTemplate();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Lock patient survey so it is not editable
    if (changes['patient']['previousValue']){
      this.service.lockSurvey(this.study.study_id,
                              changes['patient']['previousValue'].url_edit.get('survey_package_instance')
                            ).subscribe()
    }
    if (changes['patient']['currentValue']) {
      // Unlock current selected patient survey so it is editable
      this.service.unlockSurvey(this.study.study_id,
                                changes['patient']['currentValue'].url_edit.get('survey_package_instance')
                              ).subscribe()
      // Load genealogic tree
      let subtrees = [...this.patient.options.entries()].filter(p => p[0].includes('relationship'))
      this.patient = this.buildGenealogic(this.patient);
      this.chartBase = this.buildChart(this.patient);
      this.original_patient = _.cloneDeep(this.patient);
      if (subtrees.length) {
        try{
          subtrees.forEach( s => {
            let patient_base = this.patients.find(p => p.patient_id==s[1])
            let patient_to_add = undefined
            let level = 1
            if(s[0].includes('father')){
              patient_to_add = this.chartBase.find(c => c.id == this.patient.father.patient_id)
            }
            else if (s[0].includes('mother')){
              patient_to_add = this.chartBase.find(c => c.id == this.patient.mother.patient_id)
            }
            else if (s[0].includes('sister')){
              let index = s[0].substring(s[0].length - 3,s[0].length - 2)
              patient_to_add = this.chartBase.find(c => c.id == this.patient.sisters[Number(index)-1].patient_id)
            }
            else if (s[0].includes('brother')){
              let index = s[0].substring(s[0].length - 3,s[0].length - 2)
              patient_to_add = this.chartBase.find(c => c.id == this.patient.brothers[Number(index)-1].patient_id)
            }
            else if (s[0].includes('MoF')){
              patient_to_add = this.chartBase.find(c => c.id == this.patient.father.mother.patient_id)
              level = 2
            }
            else if (s[0].includes('FoF')){
              patient_to_add = this.chartBase.find(c => c.id == this.patient.father.father.patient_id)
              level = 2
            }
            else if (s[0].includes('MoM')){
              patient_to_add = this.chartBase.find(c => c.id == this.patient.mother.mother.patient_id)
              level = 2
            }
            else if (s[0].includes('FoM')){
              patient_to_add = this.chartBase.find(c => c.id == this.patient.mother.father.patient_id)
              level = 2
            }
            else if (s[0].includes('SoF')){
              let index = s[0].substring(s[0].length - 3,s[0].length - 2)
              patient_to_add = this.chartBase.find(c => c.id == this.patient.father.sisters[Number(index)-1].patient_id)
            }
            else if (s[0].includes('BoF')){
              let index = s[0].substring(s[0].length - 3,s[0].length - 2)
              patient_to_add = this.chartBase.find(c => c.id == this.patient.father.brothers[Number(index)-1].patient_id)
            }
            else if (s[0].includes('SoM')){
              let index = s[0].substring(s[0].length - 3,s[0].length - 2)
              patient_to_add = this.chartBase.find(c => c.id == this.patient.mother.sisters[Number(index)-1].patient_id)
            }
            else if (s[0].includes('BoM')){
              let index = s[0].substring(s[0].length - 3,s[0].length - 2)
              patient_to_add = this.chartBase.find(c => c.id == this.patient.mother.brothers[Number(index)-1].patient_id)
            }
            patient_to_add ? this.addSubTree(patient_base,patient_to_add,level) : this.buildTree(this.chartBase);
          })}
        catch{
          console.log('Deleted all relationships...... Something went wrong')
          this.undoChanges();
          }
      } else {
        document.getElementById('undo-button').style.visibility='hidden';
        this.buildTree(this.chartBase);
      }
    }
  }

  undoChanges(){
    this.spinner.setLoading(true);
    this.patient = this.original_patient;

    // Delete from castor all relationships
    let custom_id = [...this.form.entries()].find(el => el[1]=='add_feat_spec')[0];
    let last_custom = {}
    this.patient.options.get('add_feat_spec') ? last_custom = JSON.parse(this.patient.options.get('add_feat_spec')) : last_custom;
    for (const key of Object.keys(last_custom)){
      key.includes('relationship') ? delete last_custom[key] : key
    } 
    this.service.postCustomIcon(this.study.study_id, this.patient.patient_id, custom_id, JSON.stringify(last_custom)).subscribe()

    this.chartBase = this.buildChart(this.patient);
    this.buildTree(this.chartBase);
    document.getElementById('undo-button').style.visibility='hidden';
    this.spinner.setLoading(false);
  }

  setTreeTemplate(){
    // FEMALE CIRCLE AND MALES RECTANGLE BLACK
    FamilyTree.templates['john_male'].node = '<rect x="15" y="0" height="100" width="100" stroke-width="3" stroke="black" rx="0" ry="0" fill="transparent"></rect>';
    FamilyTree.templates['john_female'].node = '<circle cx="60" cy="50" r="50" fill="transparent" stroke-width="3" stroke="black"></circle>';
    // ICONS INSIDE NODE
    let icon = new Icons();
    FamilyTree.templates['john_male']['diabetes'] = icon.getDiabetes();
    FamilyTree.templates['john_male']['hypertension'] = icon.getHypertension();
    FamilyTree.templates['john_male']['hdl'] = icon.getHDL();    
    FamilyTree.templates['john_male']['ldl'] = icon.getLDL();
    FamilyTree.templates['john_male']['smoking'] = icon.getSmoking();
    FamilyTree.templates['john_male']['nosmoking'] = icon.getNoSmoking();
    FamilyTree.templates['john_male']['custom'] = icon.getCustom();
    FamilyTree.templates['john_male']['full'] = icon.getVersionFullBackgroundMale();
    FamilyTree.templates['john_male']['half'] = icon.getVersionHalfBackgroundMale();
    FamilyTree.templates['john_male']['dead'] = icon.getDeath();
    FamilyTree.templates['john_male']['resucited'] = icon.getResucited();
    FamilyTree.templates['john_male']['sudden_death'] = icon.getSuddenDeath();

    FamilyTree.templates['john_female']['diabetes'] = icon.getDiabetes();
    FamilyTree.templates['john_female']['hypertension'] = icon.getHypertension();
    FamilyTree.templates['john_female']['hdl'] = icon.getHDL();
    FamilyTree.templates['john_female']['ldl'] = icon.getLDL();
    FamilyTree.templates['john_female']['smoking'] = icon.getSmoking();
    FamilyTree.templates['john_female']['nosmoking'] = icon.getNoSmoking();
    FamilyTree.templates['john_female']['custom'] = icon.getCustom();
    FamilyTree.templates['john_female']['full'] = icon.getVersionFullBackgroundFemale();
    FamilyTree.templates['john_female']['half'] = icon.getVersionHalfBackgroundFemale();
    FamilyTree.templates['john_female']['dead'] = icon.getDeath();
    FamilyTree.templates['john_female']['resucited'] = icon.getResucited();
    FamilyTree.templates['john_female']['sudden_death'] = icon.getSuddenDeath();

    
    //BirthYear
    FamilyTree.templates['john_female']['field_0'] = '<text style="font-size: 16px;font-weight:bold;" fill="#aeaeae" x="60" y="145" text-anchor="middle">{val}</text>';
    FamilyTree.templates['john_male']['field_0'] = '<text style="font-size: 16px;font-weight:bold;" fill="#aeaeae" x="60" y="145" text-anchor="middle">{val}</text>';
    FamilyTree.templates['john_female']['field_1'] = '<text style="font-size: 12px;font-weight:bold;" fill="#aeaeae" x="60" y="160" text-anchor="middle">{val}</text>';
    FamilyTree.templates['john_male']['field_1'] = '<text style="font-size: 12px;font-weight:bold;" fill="#aeaeae" x="60" y="160" text-anchor="middle">{val}</text>';

    FamilyTree.templates['john'].editFormHeaderColor = '#e88f45';
    FamilyTree.templates['john_female'].editFormHeaderColor = '#e88f45';
    FamilyTree.templates['john_male'].editFormHeaderColor = '#e88f45';

    // SUBTREES
    FamilyTree.templates['john'].nodeCircleMenuButton = FamilyTree.templates['john_female'].nodeCircleMenuButton = FamilyTree.templates['john_male'].nodeCircleMenuButton = {
      radius: 15,
      x: 120,
      y: 60,
      color: '#fff',
      stroke: '#aeaeae',
      icon: FamilyTree.icon.link(10, 10, '#aeaeae')
    };

    // EDIT
    FamilyTree.elements.myTextArea = function (data, editElement, minWidth, readOnly) {
      var id = FamilyTree.elements.generateId();
      readOnly = true;
      var value = data[editElement.binding];
      if (value == undefined) value = '';
      if (readOnly && !value) {
          return {
              html: ''
          };
      }
  
      var rOnlyAttr = readOnly ? 'readonly' : '';
      var rDisabledAttr = readOnly ? 'disabled' : '';
      return {
          html: `<div class="bft-input" data-bft-input="" data-bft-input-disabled="">
                    <label for="${id}" class="hasval">${editElement.label}</label>
                    <input ${rDisabledAttr} ${rOnlyAttr} id="${id}" name="${id}" data-binding="${editElement.binding}" value="${value}" type="text">
                  </div>`,
          id: id,
          value: value

      };
  
  };

  }

  buildGenealogic(patient: Patient): Patient{
    // Principal function used to build the family given a 
    // "patient" that contains all the survey information
    patient.addFamily();
    if (patient.father){
      patient.father.addFatherFamily();
      if (patient.father.father && patient.father.mother){
        patient.chart.filter(el => el.id == patient.father.patient_id)[0].addCharacteristics(patient.father,'father').addAncestors(patient.father.father, patient.father.mother)
      } else if (patient.father.father && !patient.father.mother){
        patient.chart.filter(el => el.id == patient.father.patient_id)[0].addCharacteristics(patient.father,'father').addAncestors(patient.father.father, undefined)
      } else if (!patient.father.father && patient.father.mother){
        patient.chart.filter(el => el.id == patient.father.patient_id)[0].addCharacteristics(patient.father,'father').addAncestors(undefined, patient.father.mother)
      } 
    }

    if (patient.mother){
      patient.mother.addMotherFamily();
      if (patient.mother.father && patient.mother.mother){
        patient.chart.filter(el => el.id == patient.mother.patient_id)[0].addCharacteristics(patient.mother,'mother').addAncestors(patient.mother.father, patient.mother.mother)
      } else if (patient.mother.father && !patient.mother.mother){
        patient.chart.filter(el => el.id == patient.mother.patient_id)[0].addCharacteristics(patient.mother,'mother').addAncestors(patient.mother.father, undefined)
      } else if (!patient.mother.father && patient.mother.mother){
        patient.chart.filter(el => el.id == patient.mother.patient_id)[0].addCharacteristics(patient.mother,'mother').addAncestors(undefined,patient.mother.mother)
      } 
    }
    // Add kids
    patient.addChildren('child',patient,'')
    return patient
  }

  buildTree(chart_patient: Array<Tree>){
    // Initializes the tree element
    const tree = document.getElementById('graph');
    let icon = new Icons();

    if (tree) {
      var chart = new FamilyTree(tree, {
          template: 'john',
          orderBy: "birthday",
          levelSeparation: 100,
          lazyLoading: true,
          enableSearch: false,
          mouseScrool: FamilyTree.action.ctrlZoom,
          orientation: FamilyTree.orientation.top,
          editForm: {
            generateElementsFromFields: false,
            addMore: null,
            addMoreBtn: null,
            addMoreFieldName: null,
            elements: [
              { type: 'myTextArea', label: this.translateService.instant("ELEMENTS.FIRSTNAME"), binding: 'name'},
              { type: 'myTextArea', label: this.translateService.instant("ELEMENTS.BIRTHDATE"), binding: 'birthyear'},
              { type: 'myTextArea', label: this.translateService.instant("ELEMENTS.DIABETES"), binding: 'diabetes'},
              { type: 'myTextArea', label: this.translateService.instant("ELEMENTS.HYPERTENSION"), binding: 'hypertension'},
              { type: 'myTextArea', label: this.translateService.instant("ELEMENTS.SMOKER"), binding: 'smoking'},
              { type: 'myTextArea', label: this.translateService.instant("ELEMENTS.PAST_SMOKER"), binding: 'past_smokling'},
              { type: 'myTextArea', label: this.translateService.instant("ELEMENTS.CVD"), binding: 'full'},
              { type: 'myTextArea', label: this.translateService.instant("ELEMENTS.CVD"), binding: 'half'},
              { type: 'myTextArea', label: this.translateService.instant("ELEMENTS.LOW_HDL"), binding: 'hdl'},
              { type: 'myTextArea', label: this.translateService.instant("ELEMENTS.LDL"), binding: 'ldl'},
              { type: 'myTextArea', label: this.translateService.instant("ELEMENTS.DEAD"), binding: 'dead'},
              { type: 'myTextArea', label: this.translateService.instant("ELEMENTS.SUDDEN_DEAD"), binding: 'sudden_death'},
              { type: 'myTextArea', label: this.translateService.instant("ELEMENTS.RESUCITED"), binding: 'resucited'},
              { type: 'myTextArea', label: this.translateService.instant("ELEMENTS.BMI"), binding: 'bmi'},
              { type: 'myTextArea', label: this.translateService.instant("ELEMENTS.LPA"), binding: 'lpa'},
              { type: 'myTextArea', label: this.translateService.instant("ELEMENTS.AJMALINE"), binding: 'ajmaline'},
              { type: 'myTextArea', label: this.translateService.instant("ELEMENTS.FATTY_LIVER"), binding: 'fatty_liver'},
              { type: 'myTextArea', label: this.translateService.instant("ELEMENTS.ALAT"), binding: 'alat'},
              { type: 'myTextArea', label: this.translateService.instant("ELEMENTS.TRIGLY"), binding: 'triglycerides'},
              { type: 'myTextArea', label: this.translateService.instant("ELEMENTS.CAC"), binding: 'cac_percentile'},
              { type: 'myTextArea', label: this.translateService.instant("ELEMENTS.HDL_DETAIL"), binding: 'hdl_detail'},
              { type: 'myTextArea', label: this.translateService.instant("ELEMENTS.UNTREATED_LDL"), binding: 'untreated_ldl'},
              { type: 'textbox', label: this.translateService.instant("ELEMENTS.CUSTOM"), binding: 'custom', vlidators: { required: 'Is required'}}
            ],
            buttons: {
              web: {
                icon: icon.getEdit().replace(/fill="#aeaeae"/g, 'fill="white"'),
                text: this.translateService.instant("EDIT.SURVEY")
              },
              edit: { text: this.translateService.instant("EDIT.CUSTOM"), icon: icon.getCustom().replace(/stroke="#FFB74D"/g, 'stroke="white"')},
              share: null,
              pdf: null,
              remove: null
            }
          }, 
          
          nodeContextMenu: {},
          menu: {},
          nodeCircleMenu: {},
          scaleInitial: 0.8,
          nodeBinding: {
            field_0: "name",
            field_1: "birthyear",
            full: "full",
            half: "half",
            dead: "dead",
            resucited: "resucited",
            sudden_death:"sudden_death",
            diabetes: "diabetes",
            hypertension: "hypertension",
            hdl: "hdl",
            ldl: "ldl",
            smoking: "smoking",
            nosmoking: "nosmoking",
            past_smoking:"past_smoking",
            bmi: "bmi",
            lpa: "lpa",
            ajmaline: "ajmaline",
            fatty_live: "fatty_liver",
            alat: "alat",
            triglycerides: "triglycerides",
            cac_percentile: "cac_percentile",
            hdl_detail: "hdl_detail",
            untreated_ldl: "untreated_ldl",
            custom: "custom"
          }
      });

      // LEGEND
      chart.menuUI.on('show', function(sender, args){
        args.menu = { 
          diabetes: { text: this.translateService.instant('ICONS.DIABETES'),
            icon: icon.getDiabetes()} ,
          hypertension: { text: this.translateService.instant('ICONS.HYPERTENSION'),
            icon: icon.getHypertension()},
          hdl: { text: this.translateService.instant('ICONS.LOW_HDL'),
            icon: icon.getHDL()},
          ldl: { text: this.translateService.instant('ICONS.LDL'),
            icon: icon.getLDL()},
          smoking: { text: this.translateService.instant('ICONS.SMOKER'),
            icon: icon.getSmoking()},
          past_smoking: { text: this.translateService.instant('ICONS.PAST_SMOKER'),
            icon: icon.getPastSmoking()},
          nosmoking: { text: this.translateService.instant('ICONS.NON_SMOKER'),
            icon: icon.getNoSmoking()},
          full: {text: this.translateService.instant('ICONS.CVD_LOW'),
            icon: icon.getVersionFullBackgroundLegend()},
          half: {text: this.translateService.instant('ICONS.CVD_HIGH'),
            icon: icon.getVersionHalfBackgroundLegend()},
          dead: {text: this.translateService.instant('ICONS.DEAD'),
            icon: icon.getDeathLegend()},
          resucited: {text: this.translateService.instant('ICONS.RESUCITED'),
            icon: icon.getResucitedLegend()},
          sudden_death: {text: this.translateService.instant('ICONS.SUDDEN_DEAD'),
            icon: icon.getSuddenDeathLegend()},
          custom: {text: this.translateService.instant('ICONS.CUSTOM'),
            icon: icon.getCustom()}
        }
      }.bind(this));

      // Edit feature
      chart.editUI.on('button-click', function (sender, args) {
        if (args.name == 'web') {      
          window.open('https://data.castoredc.com/survey/'+this.patient.url_edit.get('survey_url'));
        }
      }.bind(this));

      chart.editUI.on("save", function(sender, args) {
        let id = args.data.id;
        let custom_id = [...this.form.entries()].find(el => el[1]=='add_feat_spec')[0];
        let last_custom = {}
        this.patient.options.get('add_feat_spec') ? last_custom= JSON.parse(this.patient.options.get('add_feat_spec')) : last_custom;
        // Find which family is 
        let family_member = this.findFamilyMember(id, 'custom');

        last_custom[family_member] = args.data.custom
        this.service.postCustomIcon(this.study.study_id, this.patient.patient_id, custom_id, JSON.stringify(last_custom)).subscribe()
      }.bind(this))

      // SUBTREES
      chart.nodeCircleMenuUI.on('show', function (sender, args) {
        
        args.menu.wife = {
          icon: FamilyTree.icon.addUser(30,30,'#e88f45'),
          text: this.translateService.instant('EDIT.RELATE'),
          color: "white"
        };
      }.bind(this));

      chart.nodeCircleMenuUI.on('click', function (sender, args) {
        var node = chart.getNode(args.nodeId);
        let levels = [];
        for (let n in chart.nodes){
          levels.push(chart.nodes[n]['sl'])
        }
        let max_level = Number(levels.filter(Boolean).reduce((a, b)=>Math.max(a, b)))
        this.openDialog(node, max_level)
      }.bind(this));
      
      // Load the participant family tree
      chart.load(chart_patient);
    }
  }

  buildChart(patient: Patient): Array<Tree>{
    // Append all chart elements from all family memebers
    let chart: Array<Tree> = [];
    if (patient.father){chart = chart.concat(patient.father.chart);}
    if (patient.mother){chart = chart.concat(patient.mother.chart);}
    let gender = undefined
    patient.options['sex']=='1' ? gender = 'male' : gender ='female'
    patient.gender = gender
    let patient_tree = new Tree(patient, patient.father,patient.mother, undefined,patient.name, gender, false, ['blockSubtree'] )
    chart.push(patient_tree.addCharacteristics(patient, ''))
    chart = chart.concat(patient.chart);
    return chart
  }

  openDialog(individuo: any, max_level: number): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        data: this.patients,
        id: this.patient.patient_id
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result){
        this.addSubTree(result, individuo, max_level - individuo.sl)
      } 
    });

  }

  addSubTree(patient: Patient, individuo: any, level: number = undefined) {
    // Add a family tree from another participant to the current one at a specific level
    this.spinner.setLoading(true);
    document.getElementById('undo-button').style.visibility='visible';
    // From selected participant in the dialog box, we create its patient model
    // TODO duplicated code from patients-view.component.ts fillPatient()
    this.service.getSurveyAnswers(this.study.study_id, patient.patient_id).subscribe((el_answer: any) => {
      el_answer._embedded.items.map((answer: Answer) => {
        let form_field = this.form.get(answer.field_id)
        if(
        form_field && !form_field.includes('child_') && // exclude undefined or cousins
        !form_field.includes('SoMM')&& !form_field.includes('BoMM') && // exclude great aunts
        !form_field.includes('SoFM')&& !form_field.includes('BoFM') &&
        !form_field.includes('SoMF')&& !form_field.includes('BoMF') &&
        !form_field.includes('SoFF')&& !form_field.includes('BoFF') 
        ){
          patient.options.set(form_field, answer.field_value);
        }
        
      })
      this.service.getInitialForm(this.study.study_id, patient.patient_id).subscribe((form_answer:any) => {
        form_answer._embedded['StudyDataPoints'].map((answer: any) => {
          if (answer.field_variable_name=='add_feat_spec'){
            let multiple_answer = {}
            answer.value!='' ? multiple_answer=JSON.parse(answer.value) : answer;
            for (let field in multiple_answer){
              patient.options.set(field, multiple_answer[field]);
            }
          } 
          patient.options.set(answer.field_variable_name, answer.value);
          
        })
        patient.options.delete(undefined)
        patient = this.buildGenealogic(patient);

        // From selected participant in the dialog box, we generate the corresponding chart 
        let subChart = this.buildChart(patient);

        // Save subtree
        let family_member = this.findFamilyMember(individuo.id, 'relationship');
        let custom_id = [...this.form.entries()].find(el => el[1]=='add_feat_spec')[0];
        let last_custom = {}
        this.patient.options.get('add_feat_spec') ? last_custom = JSON.parse(this.patient.options.get('add_feat_spec')) : last_custom;
        last_custom[family_member] = patient.patient_id
        this.service.postCustomIcon(this.study.study_id, this.patient.patient_id, custom_id, JSON.stringify(last_custom)).subscribe()

        // Delete old node from the original chart
        this.chartBase = this.chartBase.filter(el => el.id!=individuo.id);

        // There are three possibilities for adding subtrees: 
        //    max_level-current_level = 0 if we are adding from participant/brothers/sisters level
        //    max_level-current_level = 1 if we are adding from parents/aunts/uncles level
        //    max_level-current_level = 2 if we are adding from grandparents level
        if (level && (level==1)){
          // Update node from the tree, id fid and mid
          // We keep the rest of new info bc is more complete 
          let new_pat = subChart.find((p: Tree) => p.id == patient.patient_id);
          new_pat.id = individuo.id;
          new_pat.fid = individuo.fid;
          new_pat.mid = individuo.mid;
          individuo.pids ? new_pat.pids = individuo.pids : individuo;
          this.chartBase.push(new_pat);

          //Only adding great parents and grandparent's brothers/sisters because rest of the family should be the same in both trees
          //Adding a subtree from father family side: this.patient.father(...)
          if (individuo.tags.includes('father')){
            //Grandfather brothers
            if (patient.father && patient.father.brothers && !this.patient.father.father.brothers){
              this.patient.father.father.brothers = patient.father.brothers
              patient.father.brothers.forEach(b => {
                let granduncle: Tree = subChart.find(c => c.id == b.patient_id);
                this.chartBase.push(granduncle);
              })
            }
            //Grandfather sisters
            if (patient.father && patient.father.sisters && !this.patient.father.father.sisters){
              this.patient.father.father.sisters = patient.father.sisters
              patient.father.sisters.forEach(s => {
                let grandaunt: Tree = subChart.find(c => c.id == s.patient_id);
                this.chartBase.push(grandaunt);
              })
            }
            //Grandmother brothers
            if (patient.mother && patient.mother.brothers && !this.patient.father.mother.brothers){
              this.patient.father.mother.brothers = patient.mother.brothers
              patient.mother.brothers.forEach(b => {
                let granduncle: Tree = subChart.find(c => c.id == b.patient_id);
                this.chartBase.push(granduncle);
              })
            }
            //Grandmother sisters
            if (patient.mother && patient.mother.sisters && !this.patient.father.mother.sisters){
              this.patient.father.mother.sisters = patient.mother.sisters
              patient.mother.sisters.forEach(s => {
                let grandaunt: Tree = subChart.find(c => c.id == s.patient_id);
                this.chartBase.push(grandaunt);
              })
            }

            // Great parents
            if (patient.father && patient.father.father && !this.patient.father.father.father){
              this.patient.father.father.father = patient.father.father
              let c_greatfather: Tree = subChart.find(c => c.id == patient.father.father.patient_id);
              c_greatfather.tags.push('blockSubtree');
              this.chartBase.find(c=> c.id == this.patient.father.father.patient_id).fid = c_greatfather.id;
              this.chartBase.push(c_greatfather);
              //Brothers and sisters
              if (this.patient.father.father.father.brothers){

              }
              if (this.patient.father.father.father.sisters){
                
              }
            }
            if (patient.father && patient.father.mother && !this.patient.father.father.mother){
              this.patient.father.father.mother = patient.father.mother
              let c_greatmother: Tree = subChart.find(c => c.id == patient.father.mother.patient_id);
              c_greatmother.tags.push('blockSubtree')
              this.chartBase.find(c=> c.id == this.patient.father.father.patient_id).mid = c_greatmother.id
              this.chartBase.push(c_greatmother);
            }
            if (patient.mother && patient.mother.father && !this.patient.father.mother.father){
              this.patient.father.mother.father = patient.mother.father
              let c_greatfather: Tree = subChart.find(c => c.id == patient.mother.father.patient_id);
              c_greatfather.tags.push('blockSubtree')
              this.chartBase.find(c=> c.id == this.patient.father.mother.patient_id).fid = c_greatfather.id;
              this.chartBase.push(c_greatfather);
            }
            if (patient.mother && patient.mother.mother && !this.patient.father.mother.mother){
              this.patient.father.mother.mother = patient.mother.mother
              let c_greatmother: Tree = subChart.find(c => c.id == patient.mother.mother.patient_id);
              c_greatmother.tags.push('blockSubtree')
              this.chartBase.find(c=> c.id == this.patient.father.mother.patient_id).mid = c_greatmother.id
              this.chartBase.push(c_greatmother);
              
            }
          } else { //Adding a subtree from mother family side: this.patient.mother(...)
            //Grandfather brothers
            if (patient.father && patient.father.brothers && !this.patient.mother.father.brothers){
              this.patient.mother.father.brothers = patient.father.brothers
              patient.father.brothers.forEach(b => {
                let granduncle: Tree = subChart.find(c => c.id == b.patient_id);
                granduncle.tags.push('blockSubtree');
                this.chartBase.push(granduncle);
              })
            }
            //Grandfather sisters
            if (patient.father && patient.father.sisters && !this.patient.mother.father.sisters){
              this.patient.mother.father.sisters = patient.father.sisters
              patient.father.sisters.forEach(s => {
                let grandaunt: Tree = subChart.find(c => c.id == s.patient_id);
                grandaunt.tags.push('blockSubtree');
                this.chartBase.push(grandaunt);
              })
            }
            //Grandmother brothers
            if (patient.mother && patient.mother.brothers && !this.patient.mother.mother.brothers){
              this.patient.mother.mother.brothers = patient.mother.brothers
              patient.mother.brothers.forEach(b => {
                let granduncle: Tree = subChart.find(c => c.id == b.patient_id);
                granduncle.tags.push('blockSubtree');
                this.chartBase.push(granduncle);
              })
            }
            //Grandmother sisters
            if (patient.mother && patient.mother.sisters && !this.patient.mother.mother.sisters){
              this.patient.mother.mother.sisters = patient.mother.sisters
              patient.mother.sisters.forEach(s => {
                let grandaunt: Tree = subChart.find(c => c.id == s.patient_id);
                grandaunt.tags.push('blockSubtree');
                this.chartBase.push(grandaunt);
              })
            }

            if (patient.father && patient.father.father && !this.patient.mother.father.father){
              this.patient.mother.father.father = patient.father.father
              let c_greatfather: Tree = subChart.find(c => c.id == patient.father.father.patient_id);
              c_greatfather.tags.push('blockSubtree')
              this.chartBase.find(c=> c.id == this.patient.mother.father.patient_id).fid = c_greatfather.id;
              this.chartBase.push(c_greatfather);
            }
            if (patient.father && patient.father.mother && !this.patient.mother.father.mother){
              this.patient.mother.father.mother = patient.father.mother
              let c_greatmother: Tree = subChart.find(c => c.id == patient.father.mother.patient_id);
              c_greatmother.tags.push('blockSubtree')
              this.chartBase.find(c=> c.id == this.patient.mother.father.patient_id).mid = c_greatmother.id
              this.chartBase.push(c_greatmother);
            }
            if (patient.mother && patient.mother.father && !this.patient.mother.mother.father){
              this.patient.mother.mother.father = patient.mother.father
              let c_greatfather: Tree = subChart.find(c => c.id == patient.mother.father.patient_id);
              c_greatfather.tags.push('blockSubtree')
              this.chartBase.find(c=> c.id == this.patient.mother.mother.patient_id).fid = c_greatfather.id;
              this.chartBase.push(c_greatfather);
            }
            if (patient.mother && patient.mother.mother && !this.patient.mother.mother.mother){
              this.patient.mother.mother.mother = patient.mother.mother
              let c_greatmother: Tree = subChart.find(c => c.id == patient.mother.mother.patient_id);
              c_greatmother.tags.push('blockSubtree');
              this.chartBase.find(c=> c.id == this.patient.mother.mother.patient_id).mid = c_greatmother.id
              this.chartBase.push(c_greatmother);
              
            }
          }

        //Only adding great parents AND/OR great great parents because rest of the family should be the same in both trees
        } else if (level && (level==2)) {
          // Update node from the tree, id fid and mid
          // We keep the rest of new info bc is more complete 
          let new_pat = subChart.find((p: Tree) => p.id == patient.patient_id);
          new_pat.id = individuo.id;
          new_pat.fid = individuo.fid;
          new_pat.mid = individuo.mid;
          individuo.pids ? new_pat.pids = individuo.pids : individuo;
          this.chartBase.push(new_pat);

          //Father family side
          if (individuo.tags.includes('father')){
            //Grandfather FoF family side
            if (individuo.gender == 'male'){
              //Greatfather
              if (patient.father && !this.patient.father.father.father){
                this.patient.father.father.father = patient.father
                let c_greatfather: Tree = subChart.find(c => c.id == patient.father.patient_id);
                c_greatfather.tags.push('blockSubtree');
                this.chartBase.find(c=> c.id == this.patient.father.father.patient_id).fid = c_greatfather.id;
                this.chartBase.push(c_greatfather);
                //Great great father
                if (this.patient.father.father.father.father){
                  let c_tarafather: Tree = subChart.find(c => c.id == patient.father.father.patient_id)
                  c_tarafather.tags.push('blockSubtree');
                  this.chartBase.find(c=> c.id == this.patient.father.father.father.patient_id).fid = c_tarafather.id;
                  this.chartBase.push(c_tarafather);
                }
                //Great great mother
                if (this.patient.father.father.father.mother){
                  let c_tarafather: Tree = subChart.find(c => c.id == patient.father.mother.patient_id)
                  c_tarafather.tags.push('blockSubtree');
                  this.chartBase.find(c=> c.id == this.patient.father.father.father.patient_id).mid = c_tarafather.id;
                  this.chartBase.push(c_tarafather);
                }

                //Greatfather brothers
                if (patient.father.brothers && this.patient.father.father.father.brothers){
                  patient.father.brothers.forEach(b => {
                    let greatuncle: Tree = subChart.find(c => c.id == b.patient_id);
                    greatuncle.tags.push('blockSubtree');
                    this.chartBase.push(greatuncle);
                  })
                }
                //Greatfather sisters
                if (patient.father.sisters && this.patient.father.father.father.sisters){
                  patient.father.sisters.forEach(s => {
                    let greataunt: Tree = subChart.find(c => c.id == s.patient_id);
                    greataunt.tags.push('blockSubtree');
                    this.chartBase.push(greataunt);
                  })
                }
                
              }
              // Greatmother
              if (patient.mother && !this.patient.father.father.mother){
                this.patient.father.father.mother = patient.mother
                let c_greatmother: Tree = subChart.find(c => c.id == patient.mother.patient_id);
                c_greatmother.tags.push('blockSubtree')
                this.chartBase.find(c=> c.id == this.patient.father.father.patient_id).mid = c_greatmother.id
                this.chartBase.push(c_greatmother);
                //Great great father
                if (this.patient.father.father.mother.father){
                  let c_tarafather: Tree = subChart.find(c => c.id == patient.mother.father.patient_id)
                  c_tarafather.tags.push('blockSubtree');
                  this.chartBase.find(c=> c.id == this.patient.father.father.mother.patient_id).fid = c_tarafather.id;
                  this.chartBase.push(c_tarafather);
                }
                //Great great mother
                if (this.patient.father.father.mother.mother){
                  let c_tarafather: Tree = subChart.find(c => c.id == patient.mother.mother.patient_id)
                  c_tarafather.tags.push('blockSubtree');
                  this.chartBase.find(c=> c.id == this.patient.father.father.mother.patient_id).mid = c_tarafather.id;
                  this.chartBase.push(c_tarafather);
                }

                //Greatmother brothers
                if (patient.mother.brothers && this.patient.father.father.mother.brothers){
                  patient.mother.brothers.forEach(b => {
                    let greatuncle: Tree = subChart.find(c => c.id == b.patient_id);
                    greatuncle.tags.push('blockSubtree');
                    this.chartBase.push(greatuncle);
                  })
                }
                //Greatmother sisters
                if (patient.mother.sisters && this.patient.father.father.mother.sisters){
                  patient.mother.sisters.forEach(s => {
                    let greataunt: Tree = subChart.find(c => c.id == s.patient_id);
                    greataunt.tags.push('blockSubtree');
                    this.chartBase.push(greataunt);
                  })
                }
              }
            //Grandmother MoF family side
            } else {
              if (patient.father && !this.patient.father.mother.father){
                this.patient.father.mother.father = patient.father
                let c_greatfather: Tree = subChart.find(c => c.id == patient.father.patient_id);
                c_greatfather.tags.push('blockSubtree');
                this.chartBase.find(c=> c.id == this.patient.father.mother.patient_id).fid = c_greatfather.id;
                this.chartBase.push(c_greatfather);
                
                if (this.patient.father.mother.father.father){
                  let c_tarafather: Tree = subChart.find(c => c.id == patient.father.father.patient_id)
                  c_tarafather.tags.push('blockSubtree');
                  this.chartBase.find(c=> c.id == this.patient.father.mother.father.patient_id).fid = c_tarafather.id;
                  this.chartBase.push(c_tarafather);
                }
                if (this.patient.father.mother.father.mother){
                  let c_tarafather: Tree = subChart.find(c => c.id == patient.father.mother.patient_id)
                  c_tarafather.tags.push('blockSubtree');
                  this.chartBase.find(c=> c.id == this.patient.father.mother.father.patient_id).mid = c_tarafather.id;
                  this.chartBase.push(c_tarafather);
                }

                //Greatfather brothers
                if (patient.father.brothers && this.patient.father.mother.father.brothers){
                  patient.father.brothers.forEach(b => {
                    let greatuncle: Tree = subChart.find(c => c.id == b.patient_id);
                    greatuncle.tags.push('blockSubtree');
                    this.chartBase.push(greatuncle);
                  })
                }
                //Greatfather sisters
                if (patient.father.sisters && this.patient.father.mother.father.sisters){
                  patient.father.sisters.forEach(s => {
                    let greataunt: Tree = subChart.find(c => c.id == s.patient_id);
                    greataunt.tags.push('blockSubtree');
                    this.chartBase.push(greataunt);
                  })
                }
              }
              if (patient.mother && !this.patient.father.mother.mother){
                this.patient.father.mother.mother = patient.mother
                let c_greatmother: Tree = subChart.find(c => c.id == patient.mother.patient_id);
                c_greatmother.tags.push('blockSubtree')
                this.chartBase.find(c=> c.id == this.patient.father.mother.patient_id).mid = c_greatmother.id
                this.chartBase.push(c_greatmother);
                
                if (this.patient.father.mother.mother.father){
                  let c_tarafather: Tree = subChart.find(c => c.id == patient.mother.father.patient_id)
                  c_tarafather.tags.push('blockSubtree');
                  this.chartBase.find(c=> c.id == this.patient.father.mother.mother.patient_id).fid = c_tarafather.id;
                  this.chartBase.push(c_tarafather);
                }
                if (this.patient.father.mother.mother.mother){
                  let c_tarafather: Tree = subChart.find(c => c.id == patient.mother.mother.patient_id)
                  c_tarafather.tags.push('blockSubtree');
                  this.chartBase.find(c=> c.id == this.patient.father.mother.mother.patient_id).mid = c_tarafather.id;
                  this.chartBase.push(c_tarafather);
                }

                //Greatmother brothers
                if (patient.mother.brothers && this.patient.father.mother.mother.brothers){
                  patient.mother.brothers.forEach(b => {
                    let greatuncle: Tree = subChart.find(c => c.id == b.patient_id);
                    greatuncle.tags.push('blockSubtree');
                    this.chartBase.push(greatuncle);
                  })
                }
                //Greatmother sisters
                if (patient.mother.sisters && this.patient.father.mother.mother.sisters){
                  patient.mother.sisters.forEach(s => {
                    let greataunt: Tree = subChart.find(c => c.id == s.patient_id);
                    greataunt.tags.push('blockSubtree');
                    this.chartBase.push(greataunt);
                  })
                }
              }
            }

          } else { //Mother family side
            //Grandfather FoM family side
            if (individuo.gender == 'male'){
              //Greatfather
              if (patient.father && !this.patient.mother.father.father){
                this.patient.mother.father.father = patient.father
                let c_greatfather: Tree = subChart.find(c => c.id == patient.father.patient_id);
                c_greatfather.tags.push('blockSubtree');
                this.chartBase.find(c=> c.id == this.patient.mother.father.patient_id).fid = c_greatfather.id;
                this.chartBase.push(c_greatfather);
                //Great great father
                if (this.patient.mother.father.father.father){
                  let c_tarafather: Tree = subChart.find(c => c.id == patient.father.father.patient_id)
                  c_tarafather.tags.push('blockSubtree');
                  this.chartBase.find(c=> c.id == this.patient.mother.father.father.patient_id).fid = c_tarafather.id;
                  this.chartBase.push(c_tarafather);
                }
                //Great great mother
                if (this.patient.mother.father.father.mother){
                  let c_tarafather: Tree = subChart.find(c => c.id == patient.father.mother.patient_id)
                  c_tarafather.tags.push('blockSubtree');
                  this.chartBase.find(c=> c.id == this.patient.mother.father.father.patient_id).mid = c_tarafather.id;
                  this.chartBase.push(c_tarafather);
                }
                //Greatfather brothers
                if (patient.father.brothers && this.patient.mother.father.father.brothers){
                  patient.father.brothers.forEach(b => {
                    let greatuncle: Tree = subChart.find(c => c.id == b.patient_id);
                    greatuncle.tags.push('blockSubtree');
                    this.chartBase.push(greatuncle);
                  })
                }
                //Greatfather sisters
                if (patient.father.sisters && this.patient.mother.father.father.sisters){
                  patient.father.sisters.forEach(s => {
                    let greataunt: Tree = subChart.find(c => c.id == s.patient_id);
                    greataunt.tags.push('blockSubtree');
                    this.chartBase.push(greataunt);
                  })
                }
              }
              // Greatmother
              if (patient.mother && !this.patient.mother.father.mother){
                this.patient.mother.father.mother = patient.mother
                let c_greatmother: Tree = subChart.find(c => c.id == patient.mother.patient_id);
                c_greatmother.tags.push('blockSubtree')
                this.chartBase.find(c=> c.id == this.patient.mother.father.patient_id).mid = c_greatmother.id
                this.chartBase.push(c_greatmother);
                //Great great father
                if (this.patient.mother.father.mother.father){
                  let c_tarafather: Tree = subChart.find(c => c.id == patient.mother.father.patient_id)
                  c_tarafather.tags.push('blockSubtree');
                  this.chartBase.find(c=> c.id == this.patient.mother.father.mother.patient_id).fid = c_tarafather.id;
                  this.chartBase.push(c_tarafather);
                }
                //Great great mother
                if (this.patient.mother.father.mother.mother){
                  let c_tarafather: Tree = subChart.find(c => c.id == patient.mother.mother.patient_id)
                  c_tarafather.tags.push('blockSubtree');
                  this.chartBase.find(c=> c.id == this.patient.mother.father.mother.patient_id).mid = c_tarafather.id;
                  this.chartBase.push(c_tarafather);
                }
                //Greatmother brothers
                if (patient.mother.brothers && this.patient.mother.father.mother.brothers){
                  patient.mother.brothers.forEach(b => {
                    let greatuncle: Tree = subChart.find(c => c.id == b.patient_id);
                    greatuncle.tags.push('blockSubtree');
                    this.chartBase.push(greatuncle);
                  })
                }
                //Greatmother sisters
                if (patient.mother.sisters && this.patient.mother.father.mother.sisters){
                  patient.mother.sisters.forEach(s => {
                    let greataunt: Tree = subChart.find(c => c.id == s.patient_id);
                    greataunt.tags.push('blockSubtree');
                    this.chartBase.push(greataunt);
                  })
                }
              }
              //Grandmother MoF family side
            } else { 
              if (patient.father && !this.patient.mother.mother.father){
                this.patient.mother.mother.father = patient.father
                let c_greatfather: Tree = subChart.find(c => c.id == patient.father.patient_id);
                c_greatfather.tags.push('blockSubtree');
                this.chartBase.find(c=> c.id == this.patient.mother.mother.patient_id).fid = c_greatfather.id;
                this.chartBase.push(c_greatfather);
                
                if (this.patient.mother.mother.father.father){
                  let c_tarafather: Tree = subChart.find(c => c.id == patient.father.father.patient_id)
                  c_tarafather.tags.push('blockSubtree');
                  this.chartBase.find(c=> c.id == this.patient.mother.mother.father.patient_id).fid = c_tarafather.id;
                  this.chartBase.push(c_tarafather);
                }
                if (this.patient.mother.mother.father.mother){
                  let c_tarafather: Tree = subChart.find(c => c.id == patient.father.mother.patient_id)
                  c_tarafather.tags.push('blockSubtree');
                  this.chartBase.find(c=> c.id == this.patient.mother.mother.father.patient_id).mid = c_tarafather.id;
                  this.chartBase.push(c_tarafather);
                }
                //Greatfather brothers
                if (patient.father.brothers && this.patient.mother.mother.father.brothers){
                  patient.father.brothers.forEach(b => {
                    let greatuncle: Tree = subChart.find(c => c.id == b.patient_id);
                    greatuncle.tags.push('blockSubtree');
                    this.chartBase.push(greatuncle);
                  })
                }
                //Greatfather sisters
                if (patient.father.sisters && this.patient.mother.mother.father.sisters){
                  patient.father.sisters.forEach(s => {
                    let greataunt: Tree = subChart.find(c => c.id == s.patient_id);
                    greataunt.tags.push('blockSubtree');
                    this.chartBase.push(greataunt);
                  })
                }
              }
              if (patient.mother && !this.patient.mother.mother.mother){
                this.patient.mother.mother.mother = patient.mother
                let c_greatmother: Tree = subChart.find(c => c.id == patient.mother.patient_id);
                c_greatmother.tags.push('blockSubtree')
                this.chartBase.find(c=> c.id == this.patient.mother.mother.patient_id).mid = c_greatmother.id
                this.chartBase.push(c_greatmother);
                
                if (this.patient.mother.mother.mother.father){
                  let c_tarafather: Tree = subChart.find(c => c.id == patient.mother.father.patient_id)
                  c_tarafather.tags.push('blockSubtree');
                  this.chartBase.find(c=> c.id == this.patient.mother.mother.mother.patient_id).fid = c_tarafather.id;
                  this.chartBase.push(c_tarafather);
                }
                if (this.patient.mother.mother.mother.mother){
                  let c_tarafather: Tree = subChart.find(c => c.id == patient.mother.mother.patient_id)
                  c_tarafather.tags.push('blockSubtree');
                  this.chartBase.find(c=> c.id == this.patient.mother.mother.mother.patient_id).mid = c_tarafather.id;
                  this.chartBase.push(c_tarafather);
                }
                //Greatmother brothers
                if (patient.mother.brothers && this.patient.mother.mother.mother.brothers){
                  patient.mother.brothers.forEach(b => {
                    let greatuncle: Tree = subChart.find(c => c.id == b.patient_id);
                    greatuncle.tags.push('blockSubtree');
                    this.chartBase.push(greatuncle);
                  })
                }
                //Greatmother sisters
                if (patient.mother.sisters && this.patient.mother.mother.mother.sisters){
                  patient.mother.sisters.forEach(s => {
                    let greataunt: Tree = subChart.find(c => c.id == s.patient_id);
                    greataunt.tags.push('blockSubtree');
                    this.chartBase.push(greataunt);
                  })
                }
              }
            }
          }

          //Only add new information of the node because the rest of the tree should be the same
        } else {
          // Update node from the tree, id
          // We keep the rest of new info bc is more complete 
          let new_pat = subChart.find((p: Tree) => p.id == patient.patient_id);
          new_pat.id = individuo.id;
          individuo.pids ? new_pat.pids = individuo.pids : individuo;
          this.chartBase.push(new_pat);
        }

        // Render the tree again
        this.buildTree(this.chartBase);
        this.spinner.setLoading(false);
      })
      
    })

   
  }

  findFamilyMember(id: string, property: string): string{
    // Find which family is 
    let family_member = undefined;
    if (this.patient.patient_id == id){
      family_member=''
    } else if (this.patient.father && this.patient.father.patient_id == id){
      family_member='father_'+property
    } else if (this.patient.mother && this.patient.mother.patient_id == id){
      family_member='mother_'+property
    } else if (this.patient.father && this.patient.father.father && this.patient.father.father.patient_id == id){
      family_member='FoF_'+property
    } else if(this.patient.father && this.patient.father.mother && this.patient.father.mother.patient_id == id){
      family_member='MoF_'+property
    } else if (this.patient.mother && this.patient.mother.father && this.patient.mother.father.patient_id == id){
      family_member='FoM_'+property
    } else if(this.patient.mother&& this.patient.mother.mother && this.patient.mother.mother.patient_id == id){
      family_member='MoM_'+property
    } else if (this.patient.sisters && this.patient.sisters.filter(s => s.patient_id==id).length){
      let index = this.patient.sisters.find(s => s.patient_id==id).options.keys().next().value.substr(-1)
      family_member='sister_'+property+'_1_'+index
    } else if (this.patient.brothers && this.patient.brothers.filter(b => b.patient_id==id).length){
      let index = this.patient.brothers.find(b => b.patient_id==id).options.keys().next().value.substr(-1)
      family_member='brother_'+property+'_1_'+index
    } else if (this.patient.father && this.patient.father.brothers && this.patient.father.brothers.filter(b => b.patient_id==id).length){
      let index = this.patient.father.brothers.find(b => b.patient_id==id).options.keys().next().value.substr(-1)
      family_member='BoF_'+property+'_1_'+index
    } else if (this.patient.father && this.patient.father.sisters && this.patient.father.sisters.filter(s => s.patient_id==id).length){
      let index = this.patient.father.sisters.find(s => s.patient_id==id).options.keys().next().value.substr(-1)
      family_member='SoF_'+property+'_1_'+index
    } else if (this.patient.mother && this.patient.mother.brothers && this.patient.mother.brothers.filter(b => b.patient_id==id).length){
      let index = this.patient.mother.brothers.find(b => b.patient_id==id).options.keys().next().value.substr(-1)
      family_member='BoM_'+property+'_1_'+index
    } else if (this.patient.mother && this.patient.mother.sisters && this.patient.mother.sisters.filter(s => s.patient_id==id).length){
      let index = this.patient.mother.sisters.find(s => s.patient_id==id).options.keys().next().value.substr(-1)
      family_member='SoM_'+property+'_1_'+index
    }
    return family_member
  }
  
  ngOnDestroy(): void {
    this.service.lockSurvey(this.study.study_id,  this.patient.url_edit.get('survey_package_instance')).subscribe()
  }
}
