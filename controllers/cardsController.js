const { QueryTypes, Op } = require("sequelize");
const Card = require('../models/card');

const Payment = require('../models/payment');
const {db}=require('../database/connection');

const getAllCards = async (req, res) =>{

    try{
        const cards = await Card.findAll();
        return res.status(200).json({//200 means success
            ok: true,
            cards
        })
    } catch(err){
        console.log(err);
        return res.status(500).json({//500 error en el servidor
            ok: false,
            msg: 'Hable con el administrador'
        })
       
    }
}

const createCard = async (req, res)=>{

    const {body}=req;
    const {id_payment, card_number, owner, bank, due_date}= body;
    
    try{
        // check if the card already exist
        const payment = await Payment.findByPk(id_payment) 
        if(!payment){
            return res.status(404).json({
                ok: false,
                msg: `El pago con id ${id_payment} no existe` 
            });
        }
        // create and save 
        const cardNumber= await Card.findOne({
            where:{card_number}
        })
        if(!cardNumber){
            const card = new Card({id_payment, card_number, owner, bank, due_date});
            const newCard = await card.save();
            const cardJson = newCard.toJSON();
            id_card= cardJson['id_card']
        }
        else{
            return res.status(400).json({
                ok: false,
                msg:"Ya existe un resgistro con el numero de tarjeta "+ card_number,
            });
        }
    }catch(error){
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador",
        });
    }

    res.status(201).json({
        ok:true,
        msg: "Tarjeta creada correctamente"
    });

}

const updateCard = async(req, res)=>{
    const {id}=req.params;
    const {body}=req;
    const {id_payment, card_number}= body;
    try{
        const card= await Card.findByPk(id);
        if(!card){
            return res.status(404).json({
                ok: false,
                msg: "No existe una tarjeta con el id " + id,
            });
        }
        const payment = await Payment.findByPk(id_payment);
        if(!payment){
            return res.status(404).json({
                ok: false,
                msg: "No existe un pago con el id " + id_payment
            });
        }

        const cardNumber = await Card.findOne({
            where:{
                card_number,
                id_card: {[Op.ne]:id}
            }
        });

        if(cardNumber){
            return res.status(400).json({
                ok: false,
                msg: `Ya existe una tarjeta con este número: ${card_number}`
            })
        }

        await card.update(body);
        res.status(200).json({
            ok:true,
            msg: "Los datos de la tarjeta se actualizaron correctamente",
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            ok:false,
            msg: "Hable con el administrador"
        })
    }

}

const deleteCard = async (req, res)=>{
    const {id}= req.params;
    const {body}=req;

    try{
        const card= await Card.findOne({
            where: { id_card:id }
        });
        if(!card){
            return res.status(404).json({
                ok:false,
                msg: "No existe una tarjeta con el id " +id,
            });
        }
        await card.destroy();
        res.status(200).json({
            ok: true,
            msg: "La tarjeta se eliminó conrrectamente"
        })
    }catch(error){
        console.log(error)
        return res.status(500).json({
            ok:false,
            msg: "Hable con el administrador"
        })
    }

}

module.exports = {
    getAllCards,
    createCard,
    updateCard,
    deleteCard
}