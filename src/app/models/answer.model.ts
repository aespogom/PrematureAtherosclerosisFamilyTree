export class Answer {
    field_id: string;
    field_value: any;
    participant_id: string;
    updated_on: string;
    _links: {
        _self: {
            href: string
        }
    };

    constructor(answer_row: any){
        this.field_id = answer_row.field_id;
        this.field_value = answer_row.field_value;
        this.participant_id = answer_row.record_id;
        this.updated_on = answer_row.updated_on;
        this._links = answer_row._links;

    }
}
