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

const fee_school = 800.0;


const getFeeCourseByMajor = ( major = ' ' ) => {
    const fee_course_lic = 800.0;
    const fee_course_mas = 1500.0;
    // if(major.includes('licenciatura')){
    //     return feed_course_lic
    // }else{
    //     return feed_course_mas
    // }

    return major.toLowerCase().includes('licenciatura') ? fee_course_lic  :  fee_course_mas
}

module.exports = {
    document_types,
    fee_school,
    getFeeCourseByMajor
}