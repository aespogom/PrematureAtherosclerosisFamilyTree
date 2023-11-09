import { Tree } from "./tree.model";
import * as uuid from 'uuid';

export class Patient {
    patient_id: string = uuid.v4();
    url_edit: Map<string, string> = new Map();
    name: string = "";

    gender: string;
    family_side: string | undefined;
    options: Map<string, any>;

    father: Patient;
    mother: Patient;
    brothers: Array<Patient>;
    sisters: Array<Patient>;

    // Father's or Mother's Family
    uncles: Array<Patient>;
    aunts: Array<Patient>;
    nieces: Array<Patient>;
    nephews: Array<Patient>;

    chart: Array<Tree> = [];

    constructor(patient_row: any){
        patient_row.participant_id ? this.patient_id = patient_row.participant_id : this.patient_id;
        patient_row.survey_url_string ? this.url_edit.set('survey_url', patient_row.survey_url_string) : this.url_edit;
        patient_row.survey_package_instance_id ? this.url_edit.set('survey_package_instance', patient_row.survey_package_instance_id) : this.url_edit;
        patient_row.name ? this.name = patient_row.name : this.name;
        this.options = new Map();
    }

    deleteDuplicatedOptions(var_names: Array<string>, object: Patient = this){
        [...object.options.keys()].forEach((e)=>{ 
            if(var_names.includes(e)) object.options.delete(e)
        })
    }

    addFamily(){
        this.addFather();
        this.addMother();
        this.addBrother();
        this.addSister();
    }

    addBrother(){
        let properties: Array<any> = [...this.options.entries()].filter(el => el[0].includes('brother'));
        if (properties.length){
            let var_names: Array<string> = properties.map(subarray => subarray[0])
            let var_values: Array<any> = properties.map(subarray => subarray[1])
            let number_brothers = Number(var_values[var_names.indexOf('amount_brothers')])
            if (number_brothers>0){
                this.brothers = [];
                for (let i=1; i< number_brothers+1; i++){
                    let brother: Patient = new Patient(this.options);
                    brother.gender='male'
                    var_names.map((o,index) => {
                        o.endsWith('_'+i.toString()) ? brother.options.set(o, var_values[index]) : o
                    })
                    this.brothers.push(brother);
                    let name = [...brother.options.entries()].filter(a => a[0].includes('firstname') && a[0].endsWith('_'+i.toString())).length==1 ? [...brother.options.entries()].filter(a => a[0].includes('firstname') && a[0].endsWith('_'+i.toString()))[0][1] : 'brother '+i.toString();      
                    // CoBX are the children of the brother
                    this.addChildren('CoB'+i.toString(), brother, '_'+i.toString())
                    if (brother.options.get('brother_halfsibling_yn_'+i.toString())=='1'){
                        if (brother.options.get('brother_parent_halfsibl_'+i.toString())=='1'){
                            this.chart.push(new Tree(brother, this.father, undefined,undefined, name.toUpperCase(), 'male', false, ['blockSubtree'] ).addCharacteristics(brother, 'brother'));
                        } else {
                            this.chart.push(new Tree(brother, undefined, this.mother,undefined, name.toUpperCase(), 'male', false, ['blockSubtree'] ).addCharacteristics(brother, 'brother'));
                        }
                    } else {
                        this.chart.push(new Tree(brother, this.father, this.mother, undefined, name.toUpperCase(), 'male', false, ['blockSubtree'] ).addCharacteristics(brother, 'brother'));
                    }
                }
            }
            this.deleteDuplicatedOptions(var_names);
        }   

    }

    addSister(){
        let properties: Array<any> = [...this.options.entries()].filter(el => el[0].includes('sister'));
        if (properties.length){
            let var_names: Array<string> = properties.map(subarray => subarray[0])
            let var_values: Array<any> = properties.map(subarray => subarray[1])
            let number_sisters = Number(var_values[var_names.indexOf('amount_sisters')])
            if (number_sisters>0){
                this.sisters = [];
                for (let i=1; i< number_sisters+1; i++){
                    let sister: Patient = new Patient(this.options);
                    sister.gender='female'
                    var_names.map((o,index) => {
                        o.endsWith('_'+i.toString()) ? sister.options.set(o, var_values[index]) : o
                    })
                    this.sisters.push(sister);
                    let name = [...sister.options.entries()].filter(a => a[0].includes('firstname') && a[0].endsWith('_'+i.toString())).length==1 ? [...sister.options.entries()].filter(a => a[0].includes('firstname') && a[0].endsWith('_'+i.toString()))[0][1] : 'sister'+i.toString();
                    // CoSX are the children of the brother
                    this.addChildren('CoS'+i.toString(), sister, '_'+i.toString())
                    if (sister.options.get('sister_halfsibling_yn_'+i.toString())=='1'){
                        if (sister.options.get('sister_parent_halfsibl_'+i.toString())=='1'){
                            this.chart.push(new Tree(sister, this.father, undefined,undefined, name.toUpperCase(), 'female', false, ['blockSubtree'] ).addCharacteristics(sister, 'sister'));
                        } else {
                            this.chart.push(new Tree(sister, undefined, this.mother,undefined, name.toUpperCase(), 'female', false, ['blockSubtree'] ).addCharacteristics(sister, 'sister'));
                        }
                    } else {
                        this.chart.push(new Tree(sister, this.father, this.mother,undefined, name.toUpperCase(), 'female', false, ['blockSubtree'] ).addCharacteristics(sister, 'sister'));
                    }

                }
            }
            
            this.deleteDuplicatedOptions(var_names);
        }
    }

    addFather(father_name: string = 'father'){
        // Entra father, FoF (abuelo paterno), MoF (abuela paterna), SoF (tia paterna), BoF (tio paterno), child_SoF (primx paterno), child_BoF (primx paterno)
        let properties: Array<any> = [...this.options.entries()].filter(el => el[0].includes(father_name) || el[0].includes('oF_'));
        if (properties.length){
            let var_names: Array<string> = properties.map(subarray => subarray[0])
            let var_values: Array<any> = properties.map(subarray => subarray[1])
            this.father = new Patient(this.options)
            this.father.gender = 'male'
            var_values.map((o, index) =>
                this.father.options.set(var_names[index], o)
            );   
            let name_father = [...this.father.options.entries()].filter(a => a[0].includes('firstname') && a[0].includes(father_name)).length==1 ? [...this.father.options.entries()].filter(a => a[0].includes('firstname') && a[0].includes(father_name))[0][1] : father_name;      
            this.chart.push(new Tree(this.father, undefined, undefined, undefined, name_father.toUpperCase(), 'male', true, [father_name]));
            this.deleteDuplicatedOptions(var_names);
        }        
    }

    addMother(mother_name: string = 'mother'){
        let properties: Array<any> = [...this.options.entries()].filter(el => el[0].includes(mother_name)|| el[0].includes('oM_'));
        if (properties.length){
            let var_names: Array<string> = properties.map(subarray => subarray[0])
            let var_values: Array<any> = properties.map(subarray => subarray[1])
            this.mother = new Patient(this.options)
            this.mother.gender = 'female'
            var_values.map((o, index) =>
                this.mother.options.set(var_names[index], o)
            );
            let name_mother = [...this.mother.options.entries()].filter(a => a[0].includes('firstname') && a[0].includes(mother_name)).length==1 ? [...this.mother.options.entries()].filter(a => a[0].includes('firstname') && a[0].includes(mother_name))[0][1] : mother_name;      
            this.chart.push(new Tree(this.mother, undefined, undefined, this.father, name_mother.toUpperCase(), 'female', true, [mother_name]));
            if (this.father){
                this.chart.filter(el => el.id == this.father.patient_id)[0].addPartner(this.mother)
                this.chart.filter(el => el.id == this.mother.patient_id)[0].addPartner(this.father)
            }
            
            this.deleteDuplicatedOptions(var_names);
        }   
    }

    addFatherFamily(){
        this.addGrandFather('father');
        this.addGrandMother('father');
        this.addAunts('father');
        this.addUncles('father');  
    }

    addMotherFamily(){
        this.addGrandFather('mother');
        this.addGrandMother('mother');
        this.addAunts('mother');
        this.addUncles('mother');
    }

    addGrandFather(family_side: string = 'father'){
        // Entra FoF (abuelo paterno) o MoF (abuelo materno)
        let properties: Array<any> = [...this.options.entries()].filter(el => el[0].includes('Fo'+ family_side.substring(0,1).toUpperCase()));
        if (properties.length){
            let var_names: Array<string> = properties.map(subarray => subarray[0])
            let var_values: Array<any> = properties.map(subarray => subarray[1])
            this.father = new Patient(this.options)
            this.father.gender = 'male'
            var_values.map((o, index) =>
                this.father.options.set(var_names[index], o)
            );   
            let name_father = [...this.father.options.entries()].filter(a => a[0].includes('firstname') && a[0].includes('Fo'+ family_side.substring(0,1).toUpperCase())).length>1 ? [...this.father.options.entries()].filter(a => a[0]=='Fo'+ family_side.substring(0,1).toUpperCase() + '_firstname')[0][1] : 'grandparent';      
            this.chart.push(new Tree(this.father, undefined, undefined, undefined, name_father.toUpperCase(), 'male', true, [family_side]).addCharacteristics(this.father,'Fo'+ family_side.substring(0,1).toUpperCase()));
            this.deleteDuplicatedOptions(var_names);
        }        
    }

    addGrandMother(family_side: string = 'father'){
        // Entra FoM (abuela paterna) o MoM (abuela materna)
        let properties: Array<any> = [...this.options.entries()].filter(el => el[0].includes('Mo'+ family_side.substring(0,1).toUpperCase()));
        if (properties.length){
            let var_names: Array<string> = properties.map(subarray => subarray[0])
            let var_values: Array<any> = properties.map(subarray => subarray[1])
            this.mother = new Patient(this.options)
            this.mother.gender = 'female'
            var_values.map((o, index) =>
                this.mother.options.set(var_names[index], o)
            );   
            let name_mother = [...this.mother.options.entries()].filter(a => a[0].includes('firstname') && a[0].includes('Mo'+ family_side.substring(0,1).toUpperCase())).length>1 ? [...this.mother.options.entries()].filter(a => a[0]=='Mo'+ family_side.substring(0,1).toUpperCase() + '_firstname')[0][1] : 'grandmother';      
            this.chart.push(new Tree(this.mother, undefined, undefined, undefined, name_mother.toUpperCase(), 'female', true, [family_side]).addCharacteristics(this.mother,'Mo'+ family_side.substring(0,1).toUpperCase()));
            if (this.father){
                this.chart.filter(el => el.id == this.father.patient_id)[0].addPartner(this.mother)
                this.chart.filter(el => el.id == this.mother.patient_id)[0].addPartner(this.father)
            }
            this.deleteDuplicatedOptions(var_names);
        }        
    }


    addAunts(family_side: string){
        let properties: Array<any> = [...this.options.entries()].filter(el => el[0].includes('So'+family_side[0].toUpperCase()+'_') && !el[0].includes('child'));
        if (properties.length){
            let var_names: Array<string> = properties.map(subarray => subarray[0])
            let var_values: Array<any> = properties.map(subarray => subarray[1])
            let number_aunts: Array<number> = [0]
            var_names.forEach((vari: string) => {
                let number_member = vari.split('_')
                number_aunts.push(Number(number_member[number_member.length-1]))
                // SoF_whatever_X --> we are extracting this X
            })
            let numb = Number(number_aunts.filter(Boolean).reduce((a, b)=>Math.max(a, b)))
            if (numb>0){
                this.sisters = [];
                for (let i=1; i< numb+1; i++){
                    let aunt: Patient = new Patient(this.options);
                    aunt.family_side = family_side;
                    aunt.gender = 'female'
                    var_names.map((o,index) => {
                        o.endsWith('_'+i.toString()) ? aunt.options.set(o, var_values[index]) : o
                    })
                    this.sisters.push(aunt);
                    let name: string = [...aunt.options.entries()].filter(a => a[0].includes('firstname') && a[0].endsWith('_'+i.toString())).length==1 ? [...aunt.options.entries()].filter(a => a[0].includes('firstname') && a[0].endsWith('_'+i.toString()) )[0][1] : 'aunt'+i.toString(); 
                    // Add kids
                    aunt = this.addChildren('So'+family_side[0].toUpperCase()+'_children',aunt,'_'+i.toString())              
                    if (aunt.options.get('So'+family_side[0].toUpperCase()+'_halfsibling_yn_'+i.toString())=='1'){
                        if (aunt.options.get('So'+family_side[0].toUpperCase()+'_parent_halfsibl_'+i.toString())=='1'){
                            this.chart.push(new Tree(aunt, this.father ? this.father : undefined, undefined,undefined, name.toUpperCase(), 'female', false, [family_side] ).addCharacteristics(aunt, 'So'+family_side[0].toUpperCase()));
                        } else {
                            this.chart.push(new Tree(aunt, undefined, this.mother ? this.mother : undefined,undefined, name.toUpperCase(), 'female', false, [family_side] ).addCharacteristics(aunt, 'So'+family_side[0].toUpperCase()));
                        }
                    } else {
                        this.chart.push(new Tree(aunt, this.father ? this.father : undefined, this.mother ? this.mother : undefined ,undefined, name.toUpperCase(), 'female', false, [family_side]).addCharacteristics(aunt, 'So'+family_side[0].toUpperCase()));
                    }                   
                }
            }
            this.deleteDuplicatedOptions(var_names);
        }

    }

    addUncles(family_side: string){
        let properties: Array<any> = [...this.options.entries()].filter(el => el[0].includes('Bo'+family_side[0].toUpperCase()+'_') && !el[0].includes('child'));
        if (properties.length){
            let var_names: Array<string> = properties.map(subarray => subarray[0])
            let var_values: Array<any> = properties.map(subarray => subarray[1])
            let number_uncles: Array<number> = [0]
            var_names.forEach((vari: string) => {
                let number_member = vari.split('_')
                number_uncles.push(Number(number_member[number_member.length-1]))
                // BoF_whatever_X --> we are extracting this X
            })
            let numb = Number(number_uncles.filter(Boolean).reduce((a, b)=>Math.max(a, b)))
            if (numb>0){
                this.brothers = [];
                for (let i=1; i< numb+1; i++){
                    let uncle: Patient = new Patient(this.options);
                    uncle.family_side = family_side;
                    uncle.gender = 'male'
                    var_names.map((o,index) => {
                        o.endsWith('_'+i.toString()) ? uncle.options.set(o, var_values[index]) : o
                    })
                    this.brothers.push(uncle);
                    let name = [...uncle.options.entries()].filter(a => a[0].includes('firstname') && a[0].endsWith('_'+i.toString()) ).length==1 ? [...uncle.options.entries()].filter(a => a[0].includes('firstname') && a[0].endsWith('_'+i.toString()) )[0][1] : 'uncle'+i.toString();      
                    // Add kids
                    uncle = this.addChildren('Fo'+family_side[0].toUpperCase()+'_children', uncle, '_'+i.toString())  
                    if (uncle.options.get('Bo'+family_side[0].toUpperCase()+'_halfsibling_yn_'+i.toString())=='1'){
                        if (uncle.options.get('Bo'+family_side[0].toUpperCase()+'_parent_halfsibl_'+i.toString())=='1'){
                            this.chart.push(new Tree(uncle, this.father ? this.father : undefined, undefined,undefined, name.toUpperCase(), 'male', false, [family_side] ).addCharacteristics(uncle, 'Bo'+family_side[0].toUpperCase()));
                        } else {
                            this.chart.push(new Tree(uncle, undefined, this.mother ? this.mother : undefined,undefined, name.toUpperCase(), 'male', false, [family_side] ).addCharacteristics(uncle, 'Bo'+family_side[0].toUpperCase()));
                        }
                    } else {
                        this.chart.push(new Tree(uncle, this.father ? this.father : undefined, this.mother ? this.mother : undefined ,undefined, name.toUpperCase(), 'male', false, [family_side]).addCharacteristics(uncle, 'Bo'+family_side[0].toUpperCase()));
                    }
                }
            }
            this.deleteDuplicatedOptions(var_names);
        }

    }

    addChildren(family_prefix: string, member: Patient, underscored_number_member: string){      
        let properties_children: Array<any> = [...this.options.entries()].filter(el => el[0].includes(family_prefix));
    
        // Special case patient's children
        if (family_prefix=='child'){
            if (properties_children.filter(a=>a[0].includes('amount_children')).length){
                let number_children: number = Number(properties_children.find(a => a[0]==('amount_children'))[1])
                for (let c=1; c<number_children+1;c++){
                    let properties_kid: Array<any> = properties_children.filter(el => el[0].endsWith('_'+c.toString()));
                    let var_names: Array<string> = properties_kid.map(subarray => subarray[0])
                    let var_values: Array<any> = properties_kid.map(subarray => subarray[1])
                    let kid: Patient = new Patient({})
                    var_names.map((o,index) => {
                        o.includes(c.toString()) ? kid.options.set(o, var_values[index]) : o
                    })
                    let name = [...kid.options.entries()].filter(a => a[0].includes('firstname') && a[0].includes(c.toString()) ).length==1 ? [...kid.options.entries()].filter(a => a[0].includes('firstname') && a[0].includes(c.toString()) )[0][1] : 'kid '+c.toString();      
                    if (member.gender == 'male'){
                        this.chart.push(new Tree(kid, member, undefined, undefined, name, undefined, false, ["blockSubtree"]).addCharacteristics(kid, family_prefix));
                    } else {
                        this.chart.push(new Tree(kid, undefined, member, undefined, name, undefined, false, ["blockSubtree"]).addCharacteristics(kid, family_prefix));
                    }
                    this.deleteDuplicatedOptions(var_names);
                }
            }
            // Special case Brother or Sister children
        } else if (family_prefix.startsWith('CoS' || 'CoB')) {
            if (properties_children.filter(a => a[0].includes('yn'+underscored_number_member)&& a[1]=='1'||a[0].includes('_amount'+underscored_number_member)).length){
                let var_names: Array<string> = properties_children.map(subarray => subarray[0])
                let var_values: Array<any> = properties_children.map(subarray => subarray[1])
                let number_children: Array<number> = [0]
                var_names.forEach((vari: string) => {
                    let number_member = vari.split('_')
                    number_children.push(Number(number_member[number_member.length-1]))
                    // CoS_whatever_X --> we are extracting this X
                })
                let numb = Number(number_children.filter(Boolean).reduce((a, b)=>Math.max(a, b)))
                if (numb>0){
                    for (let i=1; i< numb+1; i++){
                        let kid: Patient = new Patient({});
                        var_names.map((o,index) => {
                            o.endsWith('_'+i.toString()) ? kid.options.set(o, var_values[index]) : o
                        })
                        let name = [...kid.options.entries()].filter(a => a[0].includes('firstname') && a[0].endsWith('_'+i.toString()) ).length==1 ? [...kid.options.entries()].filter(a => a[0].includes('firstname') && a[0].endsWith('_'+i.toString()) )[0][1] : 'kid '+i.toString();      
                        if (member.gender == 'male'){
                            this.chart.push(new Tree(kid, member, undefined, undefined, name, undefined, false, ["blockSubtree"]).addCharacteristics(kid, family_prefix));
                        } else {
                            this.chart.push(new Tree(kid, undefined, member, undefined, name, undefined, false, ["blockSubtree"]).addCharacteristics(kid, family_prefix));
                        }
                    }
                }
                this.deleteDuplicatedOptions(var_names);
            }

            // Special case Aunt or Uncle children
        } else {
            let family_side = member.family_side
            if (properties_children.filter(a => a[0].includes('yn'+underscored_number_member)&& a[1]=='1'||a[0].includes('_amount'+underscored_number_member)).length){
                let number_children: number = Number(properties_children.filter(a => a[0]==family_prefix+'_amount'+underscored_number_member)[0][1])
                let number_cvd: number = Number(properties_children.filter(a => a[0]==family_prefix+'_cvd'+underscored_number_member)[0][1])
                for (let c=1; c<number_children+1; c++){
                    let nephew_properties = new Map()
                    let nephew: Patient = new Patient(nephew_properties)
                    if (c<=number_cvd){
                        nephew.options.set(family_prefix+'_cvd','1')
                    }
                    if (member.gender == 'male'){
                        this.chart.push(new Tree(nephew, member, undefined, undefined, 'Nicht '+ c, undefined, false, [family_side]).addCharacteristics(nephew, family_prefix));
                    } else {
                        this.chart.push(new Tree(nephew, undefined, member, undefined, 'Nicht '+ c, undefined, false, [family_side]).addCharacteristics(nephew, family_prefix));
                    }
                }
                member.options.delete(family_prefix+'_yn'+underscored_number_member)
                member.options.delete(family_prefix+'_amount'+underscored_number_member)
                member.options.delete(family_prefix+'_cvd'+underscored_number_member)
            }
        }
        return member
    }
}

