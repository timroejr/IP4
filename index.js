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

const getClient = (request, response) => {

    console.log(request);
    const {clientname, businessname} = request.query;
    console.log(clientname);
    console.log(businessname);

    if (request.query != null) {
        pool.query('SELECT * FROM CLIENT WHERE lower(clientname) LIKE $1 OR lower(businessname) LIKE $2', ['%' + clientname + '%', '%' + businessname + '%'],
            (error, results) => {
                if (error) {
                    response.status(502);
                    throw error;
                } else {
                    response.status(200).json(results.rows)
                }
            });
    } else {
        pool.query('SELECT * FROM CLIENT', (error, results) => {
            if (error) {
                response.status(502);
            } else {
                response.status(200).json(results.rows);
            }
        });

    }


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

const getHardware = (request, response) => {

    const {client} = request.query;

    pool.query('SELECT * FROM hardware FULL JOIN VOIP ON HARDWARE.MACID = VOIP.MACID FULL JOIN COMPUTER ON HARDWARE.MACID = COMPUTER.MACID WHERE "client" = $1', [client],
        (error, results) => {
        if (error) {
            throw error;
        } else {
            response.status(200).json({status: 'success', message: results.rows});
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

const getInvoice = (request, response) => {

    const {client, invoicenumber} = request.query;

    if (invoicenumber != null) {

        pool.query('SELECT * FROM invoice WHERE invoicenumber = $1', [invoicenumber],
            (error, results) => {
                if (error) {
                    throw error;
                } else {
                    pool.query('select internalcomponents."name", internalcomponents.price, internalcomponents.quantity, internalcomponents.tax, internalcomponents.vendor from invoicerelation right join internalcomponents on invoicerelation.itemnumber = internalcomponents.id where invoicerelation.invoicenumber = $1', [invoicenumber],
                        (error, results2) => {
                            if (error) {
                                throw error;
                            } else {
                                let returnedValue = results.rows[0];
                                console.log(returnedValue);
                                returnedValue.parts = results2.rows;
                                response.status(201).json({status: "success", message: returnedValue})
                            }
                        });
                }
            });



    } else {
        pool.query('SELECT * FROM invoice WHERE businessId = $1', [client],
            (error, results) => {
                if (error) {
                    throw error;
                } else {
                    response.status(201).join({status: "success", message: results.rows});
                }
            });
    }

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

const getComponent = (request, response) => {

    const {partname, id, vendor} = request.query;

    if (partname || id || vendor) {
        pool.query('SELECT * FROM internalcomponents WHERE lower(name) LIKE $1 OR id LIKE $2 OR lower(vendor) LIKE $3', ['%' + partname + '%', '%' + id + '%', '%' + vendor + '%'],
            (error, results) => {
                if (error) {
                    throw error;
                } else {
                    response.status(200).json({status: "success", message: results.rows});
                }
            })
    } else {
        pool.query('SELECT * FROM internalcomponents',
            (error, results) => {
                if (error) {
                    throw error;
                } else {
                    response.status(200).json({status: "success", message: results.rows});
                }
            });
    }




}

const createHardwareTest = (request, response) => {
    const {dateexecuted, writespeed, readspeed, accesstime, cpuutilization, gpufps, openglscore, computerservicetag} = request.body;
    pool.query('INSERT INTO hardwaretests (dateexecuted, writespeed, readspeed, accesstime, cpuutilization, gpufps, openglscore) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING hardwaretest', [dateexecuted, writespeed, readspeed, accesstime, cpuutilization, gpufps, openglscore],
        (error, results) => {

            console.log(results);
            if (error) {
                console.error(error.stack)
                throw error;
            } else {
                var testResponse = results.rows[0].hardwaretest;
                pool.query('INSERT INTO hardwarerelation (servicetag, hardwaretest) VALUES ($1, $2)', [computerservicetag, testResponse],
                    (error, results) => {
                        if (error) {
                            console.error(error.stack);
                            throw error;
                        } else {
                            response.status(201).json({status: "success", message: {"serviceTag": computerservicetag, "hardwareTest": testResponse}});
                        }
                    });
            }

        });
}

const getHardwareTest = (request, response) => {

    const {computerservicetag} = request.query;

    let serviceTagString = computerservicetag.toString();

    pool.query('select * from hardwaretests inner join hardwarerelation on hardwarerelation.hardwaretest = hardwaretests.hardwaretest where hardwarerelation.servicetag = $1', [serviceTagString],
        (error, results) => {
            if (error) {
                throw error;
            } else {
                response.status(200).json({status: "success", message: results.rows});
            }
        });

}

const createSoftware = (request, response) => {

    const {name, dateinstalled, licensekey, computerservicetag} = request.body;
    pool.query('INSERT INTO software (name, dateinstalled, licensekey) VALUES ($1, $2, $3) RETURNING softwareid', [name, dateinstalled, licensekey],
        (error, results) => {
            if (error) {
                console.error(error.stack);
                throw error;
            } else {
                var softwareIdCreated = results.rows[0].softwareid;
                pool.query('INSERT INTO softwarerelation (softwareid, servicetag) VALUES ($1, $2)', [softwareIdCreated, computerservicetag],
                    (error, results) => {
                        if (error) {
                            console.error(error.stack);
                            throw error;
                        } else {
                            response.status(201).json({status: "success", message: {"serviceTag" : computerservicetag, "softwareId": softwareIdCreated}});
                        }
                    });
            }
        })

}

const getSoftware = (request, response) => {

    const {computerservicetag} = request.query;

    let serviceTagString = computerservicetag.toString();

    pool.query('select * from software inner join softwarerelation on softwarerelation.softwareid = software.softwareid where softwarerelation.servicetag = $1', [serviceTagString],
        (error, results) => {
            if (error) {
                throw error;
            } else {
                response.status(200).json({status: "success", message: results.rows});
            }
        });

}


//Create Routes for API
app.route('/client').post(createNewClient).get(getClient);
app.route('/hardware').post(createNewHardware).get(getHardware);
app.route('/voip').post(createVoipHardware);
app.route('/computer').post(createComputerHardware);

app.route('/invoice').post(createInvoice).get(getInvoice);
app.route('/component').post(createInternalComponent).get(getComponent);

app.route('/hardwareTest').post(createHardwareTest).get(getHardwareTest);

app.route('/software').post(createSoftware).get(getSoftware);

//Startup REST API Listener on Port 3000
app.listen(3000, () => {
    console.log("Listening on port 3000");
});
