interface Loc {
    lat: number
    lon: number
}

interface Experience {
    startTime: number
    endTime: number
    company: string
    title: string
}

export interface User {
    _id: string
    email: string
    userName: string
    fullName: string
    loc: Loc
    skills: string[]
    experience: Experience[]
    gender: string
    imgUrl: string
    password?: string
}



