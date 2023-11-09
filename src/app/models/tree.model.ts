import { Patient } from "./patient.model";

export class Tree {
    id: string;
    name: string;
    birthyear: string;
    gender: string;
    pids: Array<string>;
    ppid: Array<string>;
    fid: string;
    mid: string;
    tags: Array<string> = [];

    //icons
    diabetes: string;
    hypertension: string;
    hdl: string;
    ldl: string;
    smoking: string;
    nosmoking: string ='No smoker';
    past_smoking: string;
    hasChildren: Boolean | null = null;
    hasNoChildren: Boolean | null = null;
    custom: string;
    full: string;
    half: string;
    dead: string;
    resucited: string;
    sudden_death: string;

    // Onderzoek checklist
    bmi: string;
    lpa: string;
    ajmaline: string;
    fatty_liver: string;
    alat: string;
    triglycerides: string;
    cac_percentile: string;
    hdl_detail: string
    untreated_ldl: string;


    constructor(patient: Patient, father: Patient | undefined, mother:Patient | undefined, partner: Patient | undefined, name_pat: string ='indiv', gender: string = 'female', hasChildren: Boolean = false, tags: Array<string> = undefined){
        this.id = patient.patient_id;
        this.addAncestors(father, mother)
        if (partner){
            this.addPartner(partner)
        }
        this.name = name_pat;
        this.gender = gender;
        hasChildren ? this.hasChildren = hasChildren : this.hasNoChildren=true;
        [...patient.options].filter(op => op[0].includes('birthyear')).length ? this.birthyear = [...patient.options].filter(op => op[0].includes('birthyear'))[0][1] : this.birthyear;
        tags ? tags.forEach( t => this.tags.push(t)) : this.tags;
        
    }

    addAncestors(father: Patient | undefined, mother: Patient | undefined){
        if (father){
            this.fid = father.patient_id;
        }
        if (mother) {
            this.mid = mother.patient_id;
        }
    }

    addPartner(partner: Patient){
        this.pids = [partner.patient_id];
    }

    addCharacteristics(patientFinal: Patient, family_prefix: string): Tree{
        let diabetes_array = [...patientFinal.options.entries()].filter(el => el[0].includes(family_prefix+'_diab_') || el[0].includes(family_prefix+'diabetes') )
        if (diabetes_array.filter(el => el[0].includes('yn') && el[1]=="1").length){    // checked: brother, sister
            this.diabetes="" 
            if ( diabetes_array.filter(el => el[0].includes('age')).length){
                this.diabetes = this.diabetes+ diabetes_array.filter(el => el[0].includes('age'))[0][1]
            }  else if ( diabetes_array.filter(el => el[0].includes('_dt_')).length){
                this.diabetes = this.diabetes+ diabetes_array.filter(el => el[0].includes('_dt_'))[0][1] 
            }  
        }
        let high_bp_array = [...patientFinal.options.entries()].filter(el => el[0].includes(family_prefix+'_bp_') || el[0].includes(family_prefix+'_highbp_') ||el[0].includes(family_prefix+'bp_high'))
        if (high_bp_array.filter(el => el[0].includes('yn') && el[1]=="1").length){
            // this.hypertension=[...patientFinal.options.entries()].filter(el => el[0].includes('bp_')).join('-') // join?
            this.hypertension=""
            if ( high_bp_array.filter(el => el[0].includes('age')).length){
                this.hypertension = this.hypertension+ high_bp_array.filter(el => el[0].includes('age'))[0][1]
                if ( high_bp_array.filter(el => el[0].includes('pregn') && el[1]=="1").length){
                    this.hypertension = this.hypertension+" During pregnancy. "
                }  
            }  
        }
        let hdl_array = [...patientFinal.options.entries()].filter(el => el[0].includes(family_prefix+'_highchol_') || el[0].includes(family_prefix+'_chol_') || el[0].includes(family_prefix+'_HDL_'))
        if (hdl_array.filter(el => el[0].includes('yn') && el[1]=="1").length){
            
            if ( hdl_array.filter(el => el[0].includes('result')).length){ //SISTER RESLT??
                this.hdl = hdl_array.filter(el => el[0].includes('result'))[0][1]
            }
        } else if ( hdl_array.filter(el => el[0].includes('untrt_cholest_HDL')).length){ //PATIENT 
            this.hdl = hdl_array.filter(el => el[0].includes('_HDL_'))[0][1]
        }
        let ldl_array = [...patientFinal.options.entries()].filter(el => el[0].includes('untrt_cholest_LDL'))
        if (ldl_array.filter(el => el[1]=='1').length){
            this.ldl=ldl_array.filter(el => el[1]=='1')[0][1]
        }
        let smoking_array = [...patientFinal.options.entries()].filter(el => (el[0].includes(family_prefix+'_smoking') || el[0].includes(family_prefix+'_smoke') || el[0].includes(family_prefix+'smoke')))
        if (smoking_array.filter(el => el[0].includes('yn') && el[1]=="1" && !el[0].includes('stop')).length){
            this.smoking="True"
            this.nosmoking=null;
        } else if (smoking_array.filter(el => el[0].includes('stop') && el[1]=='1').length){
            this.past_smoking="True";
            this.nosmoking=null;
        }
        let cvd_array = [...patientFinal.options.entries()].filter(el => el[0].includes(family_prefix+'_cvd') || el[0].includes(family_prefix+'_age_cvd'))
        if (cvd_array.filter(el => el[0].includes('yn') && el[1]=="1").length){
            if (cvd_array.filter(el => el[0].includes('start') || el[0].includes('age')).length){ 
                if (patientFinal.gender=='male'){
                    if (cvd_array.filter(el => ( el[0].includes('age') && (el[1]=='1' || (Number(el[1])<51 && el[1]!='2')))).length){
                        this.full="< 51"
                    } else if (cvd_array.filter(el => ( el[0].includes('age') && (el[1]=='2' || (Number(el[1])>=51 && el[1]!='1')))).length){
                        this.half='> 51'
                    }
                } else if (patientFinal.gender=='female'){
                    if (cvd_array.filter(el => ( el[0].includes('age') && (el[1]=='1' || (Number(el[1])<56 && el[1]!='2')))).length){
                        this.full="< 56"
                    } else if (cvd_array.filter(el => ( el[0].includes('age') && (el[1]=='2' || (Number(el[1])>=56 && el[1]!='1')))).length){
                        this.half='> 56'
                    }
                }                 
            }
        } else if (cvd_array.filter(el => el[0].includes('children')).length){
            this.full='< 56'
        }
        // Special case for patient filling the survey, has more than one cvd possible event
        if (family_prefix==''){
            let cvd_array = [...patientFinal.options.entries()].filter(el => el[0].includes('heart_attack') || el[0].includes('tia') || el[0].includes('legpain') || el[0].includes('pulm_embol') || el[0].includes('stroke'))
            if(cvd_array.filter(el => el[0].includes('yn') && el[1]=='1').length){
            
                if (patientFinal.gender=='male'){
                    if (cvd_array.filter(el => el[0].includes('yr')).some( el => { Number(el[1]) - Number(patientFinal.options.get('birthyear_pat')) < 51})){
                        this.full="< 51"
                    } else {
                        this.half='> 51'
                    }
                } else if (patientFinal.gender=='female'){
                    if (cvd_array.filter(el => el[0].includes('yr')).some( el =>  Number(el[1]) - Number(patientFinal.options.get('birthyear_pat')) < 56)){
                        this.full="< 56"
                    } else {
                        this.half='> 56 '
                    }
                }
            }
        }
        let dead_array = [...patientFinal.options.entries()].filter(el => el[0].includes(family_prefix+'_dead'))
        if(dead_array.filter(el => el[0].includes('yn') && el[1]=='1').length){
            if (dead_array.filter(el => el[0].includes('age') && Number(el[1])<65).length){
                this.sudden_death=dead_array.find(el => el[0].includes('age'))[1];
            } else {
                this.dead=dead_array.find(el => el[0].includes('age'))[1] ;
            }
        }
        let reanimated_array = [...patientFinal.options.entries()].filter(el => el[0].includes(family_prefix+'_reanimated_') || el[0].includes('reanimated'))
        if(reanimated_array.filter(el => el[0].includes('yn') && el[1]=='1').length){
            this.resucited = reanimated_array.find(el => el[0].includes('yr'))[1];
        }

        if ([...patientFinal.options.entries()].filter(el => el[0].includes(family_prefix+'_custom')).length){
            this.custom = [...patientFinal.options.entries()].filter(el => el[0].includes(family_prefix+'_custom'))[0][1]
        }
        

        // Onderzoek checklist
        let bmi_array = [...patientFinal.options.entries()].filter(el => el[0]=='bmi_calc')
        if (bmi_array.length){
            this.bmi=bmi_array[0][1]
        }
        let lpa_array = [...patientFinal.options.entries()].filter(el => el[0]=='calc_Lpa_mgL_nmolL')
        if (lpa_array.length){
            this.lpa = lpa_array[0][1]+" nmol/L"
        }
        let ajmaline_array = [...patientFinal.options.entries()].filter(el => el[0]=='ajmaline_test')
        if (ajmaline_array.length){
            if (ajmaline_array[0][1]=="2"){
                this.ajmaline='Positive'
            }
        }
        let liver_array = [...patientFinal.options.entries()].filter(el => el[0]=='Fatty_liver_index')
        if (liver_array.length){
            this.fatty_liver = liver_array[0][1]
        }
        let alat_array = [...patientFinal.options.entries()].filter(el => el[0]=='ALAT')
        if (alat_array.length){
            this.alat = alat_array[0][1]+' U/L 37ºC'
        }
        let triglycerides_array = [...patientFinal.options.entries()].filter(el => el[0]=='Trigly_UT')
        if (triglycerides_array.length){
            this.triglycerides = triglycerides_array[0][1]+' mmol/L'
        }
        let cac_array = [...patientFinal.options.entries()].filter(el => el[0]=='Ca_score_percentile')
        if (cac_array.length){
            this.cac_percentile = cac_array[0][1]
        }
        let hdl_detail_array = [...patientFinal.options.entries()].filter(el => el[0]=='HDL_UT')
        if (hdl_detail_array.length){
            this.hdl_detail = hdl_detail_array[0][1]+' mmol/L'
        }
        let untreated_ldl_array = [...patientFinal.options.entries()].filter(el => el[0]=='LDL_UT')
        if (untreated_ldl_array.length){
            this.untreated_ldl = untreated_ldl_array[0][1]+' mmol/L'
        }

        return this
    }
}

