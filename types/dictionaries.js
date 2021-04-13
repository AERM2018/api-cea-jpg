const document_types = [
    { name: 'Constancia con de estudios. (Con calificaciones)', price: 500 },
    { name: 'Constancia de estudios (Sin calificaciones)', price: 500 },
    { name: 'Carta maestrante', price: 500 },
    { name: 'Kardex', price: 500 },
    { name: 'Credenciales', price: 500 },
    { name: 'Certificado', price: 500 },
    { name: 'Acta de examen', price: 500 },
    { name: 'Oficio de servicio social y practicas', price: 500 },
    { name: 'Titulo', price: 500 },
    { name: 'Constancia de título en proceso', price: 500 },
]

const fee_school = [
    { major_name : 'Licenciatura' , price : 800},
    { major_name : 'Maestria' , price : 1500}
]

const fee_course = [
    { major_name : 'Licenciatura' , price : 800},
    { major_name : 'Maestria' , price : 1500}
]

const getFeeSchoolByMajor = ( major  = ' ') => {
    const fee = fee_school.find( ({major_name}) => major.includes(major_name));
    return fee.price
     
}


const getFeeCourseByMajor = ( major  = ' ') => {
    const fee = fee_course.find( ({major_name}) =>  major.includes(major_name))
    return fee.price
}

module.exports = {
    document_types,
    fee_school,
    fee_course,
    getFeeSchoolByMajor,
    getFeeCourseByMajor
}