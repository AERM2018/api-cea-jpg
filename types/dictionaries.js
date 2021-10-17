const document_types = [
    { name: 'Constancia de estudios.', price: 50 },
    { name: 'Constancia de estudios con calificaciones.', price: 100 },
    { name: 'Carta maestrante.', price: 500 },
    { name: 'Credencial.', price: 500 },
    { name: 'Certificado de maestria.', price: 500 },
    { name: 'Certificado de licenciatura.', price: 500 },
    { name: 'Titulo de maestria.', price: 500 },
    { name: 'Titulo de licenciatura.', price: 500 },
    { name: 'Acta de examen.', price: 4500 },
    { name: 'Constancia de titulo en progreso.', price: 500 },
]
const expenses_type = [
    'Transporte',
    'Artículos de limpieza',
    'Artículos de oficina',
    'Servicios básicos',
    'Comida',
    'Pagos a maestros',
    'Pagos a personal administrativo',
    'Pagos al sistema',
    'Pagos a servicios extras',
    'Pagos para eventos'
]

const fee_school = [
    { major_name : 'licenciatura' , price : 800},
    { major_name : 'maestria' , price : 1500}
]

const fee_course = [
    { major_name : 'licenciatura' , price : 800},
    { major_name : 'maestria' , price : 1500}
]

const getFeeSchoolByMajor = ( major  = ' ') => {
    const fee = fee_school.find( ({major_name}) => major_name === major.toLowerCase())
    return fee.price
    
}


const getFeeCourseByMajor = ( major  = ' ') => {
    const fee = fee_course.find( ({major_name}) =>  major_name === major.toLowerCase())
    return fee.price
}

module.exports = {
    document_types,
    fee_school,
    fee_course,
    getFeeSchoolByMajor,
    getFeeCourseByMajor,
    expenses_type
}