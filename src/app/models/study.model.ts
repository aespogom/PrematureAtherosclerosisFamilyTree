export class Study {
    study_id: string;
    name: string;
    created_by: string;
    created_on: string;
    trial_registry_id: string;

    _links: {
        _self: {
            href: string
        }
    }

    constructor(study_row: any){
        this.study_id = study_row.study_id;
        this.name = study_row.name;
        this.created_by = study_row.created_by;
        this.created_on = study_row.created_on;
        this.trial_registry_id = study_row.trial_registry_id;
        this._links = study_row._links;
    }
}
