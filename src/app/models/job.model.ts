interface Loc {
    lat: number
    lon: number
}


export interface Job {
    _id:string
    title: string
    company:string
    loc: Loc
    skillsRequired: string[]
    type:string
    place:string
    datePosted:number
}