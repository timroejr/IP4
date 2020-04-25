const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const {pool} = require("./db_config");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

const createNewClient = (request, response) => {

    const {clientName, address, city, state, zip, phone, email, businessname} = request.body;

    pool.query('INSERT INTO client (clientname,address,city,state,zip,phone,email,businessname) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [clientName, address, city, state, zip, phone, email, businessname],
        error => {
            if (error) {
                response.status(405).json({status: 'error', message: "Payload is formatted imporperly"})
            } else {
                response.status(201).json({status: 'success', message: "Created New Client."})
            }
        });

}

const createNewHardware = (request, response) => {

    const {macid, name, client, purchasedate, isvoip, iscompute} = request.body;
    pool.query('INSERT INTO hardware (macid, name, client, purchasedate, isvoip, iscompute) VALUES ($1, $2, $3, $4, $5, $6)', [macid, name, client, purchasedate, isvoip, iscompute],
        error => {
            if (error) {
                //response.status(405);
                throw error;
            } else {
                response.status(201).json({status: 'success', message: "Created New Hardware"})
            }


        });
}

const createVoipHardware = (request, response) => {

    const {macid, number} = request.body;
    pool.query('INSERT INTO voip (macid, numberassociated) VALUES ($1, $2)', [macid, number],
        error => {
            if (error) {
                throw error;
            } else {
                response.status(201).json({status: 'success', message: 'Created new VoIP Object'})
            }
        })
}

const createComputerHardware = (request, response) => {

    const {serviceTag, macId, name, activateDate} = request.body;
    pool.query('INSERT INTO computer (servicetag, macid, name, activatedate) VALUES ($1, $2, $3, $4)', [serviceTag, macId, name, activateDate],
        error => {
            if (error) {
                throw error;
            } else {
                response.status(201).json({status: 'success', message: 'Created new computer Object'})
            }
        });
}

const createInvoice = (request, response) => {
    const {invoiceNumber, businessId, isQuote, laborCost} = request.body;
    pool.query('INSERT INTO invoice (invoicenumber, businessid, isquote, laborcost) VALUES ($1, $2, $3, $4)', [invoiceNumber, businessId, isQuote, laborCost],
        error => {
            if (error) {
                throw error;
            } else {
                response.status(201).json({status: "success", message: "Created new invoice"})
            }
        });
}

const createInternalComponent = (request, response) => {
    const {id, name, price, vendor, quantity, tax} = request.body;
    pool.query('INSERT INTO internalcomponents (id, name, price, vendor, quantity, tax) VALUES ($1, $2, $3, $4, $5, $6)', [id, name, price, vendor, quantity, tax],
        error => {
            if (error) {
                throw error;
            } else {
                response.status(201).json({status: "success", message: "Created new component"})
            }
        });
}



app.route('/client').post(createNewClient);
app.route('/hardware').post(createNewHardware);
app.route('/voip').post(createVoipHardware);
app.route('/computer').post(createComputerHardware);

app.route('/invoice').post(createInvoice);
app.route('/component').post(createInternalComponent);

app.listen(3000, () => {
    console.log("Listening on port 3000");
});
