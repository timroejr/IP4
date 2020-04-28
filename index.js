const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const {pool} = require("./db_config");

const app = express();
const path = require('path');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

const createNewClient = (request, response) => {

    const {clientName, address, city, state, zip, phone, email, businessname} = request.body;

    pool.query('INSERT INTO client (clientname,address,city,state,zip,phone,email,businessname) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING businessid', [clientName, address, city, state, zip, phone, email, businessname],
        (error, results) => {
            if (error) {
                console.log(error)
                response.status(405).json({status: 'error', message: "Payload is formatted imporperly"})
            } else {
                response.status(201).json({status: 'Created new business', message: results.rows})
            }
        });

}

const getClient = (request, response) => {

    console.log(request);
    const {clientname, businessname} = request.query;
    console.log(clientname);
    //console.log(businessname);

    if (clientname !== undefined) {
        pool.query('SELECT * FROM CLIENT WHERE lower(clientname) LIKE $1', ['%' + clientname + '%'],
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
    pool.query('INSERT INTO hardware (macid, name, client, purchasedate) VALUES ($1, $2, $3, $4)', [macid, name, client, purchasedate],
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

    const {serviceTag, macId, activateDate} = request.body;
    pool.query('INSERT INTO computer (servicetag, macid, activatedate) VALUES ($1, $2, $3)', [serviceTag, macId, activateDate],
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
    pool.query('INSERT INTO invoice (businessid, isquote, laborcost) VALUES ($1, $2, $3) returning invoicenumber', [businessId, isQuote, laborCost],
        (error, results) => {
            if (error) {
                throw error;
            } else {
                response.status(201).json({status: "Created new invoice", message: results.rows})
            }
        });
}

const getInvoice = (request, response) => {

    const {client, invoicenumber} = request.query;

    if (invoicenumber != null) {

        pool.query('SELECT * FROM invoice WHERE invoicenumber = $1', [invoicenumber],
            (error, results) => {
                if (error) {
                    response.status(400).json({status: "error", message: "invalid invoice number"})
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
        pool.query('SELECT invoicenumber FROM invoice WHERE businessId = $1', [client],
            (error, results) => {
                if (error) {
                    throw error;
                } else {
                    //response.status(200).json({status: "success", message: results.rows.invoicenumber});
                    response.status(200).json({status: "success", message: results.rows});
                }
            });
    }

}

const createInternalComponent = (request, response) => {
    const {id, name, price, vendor, quantity, tax} = request.body;
    pool.query('INSERT INTO internalcomponents (name, price, vendor, quantity, tax) VALUES ($1, $2, $3, $4, $5) returning *', [name, price, vendor, quantity, tax],
        (error,results) => {
            if (error) {
                throw error;
            } else {
                response.status(201).json({status: "success", message: results.rows})
            }
        });
}

const getComponent = (request, response) => {

    const {partname, vendor} = request.query;

    console.log(partname);
    console.log(vendor);

    if (partname !== undefined) {
        pool.query('SELECT * FROM internalcomponents WHERE lower(name) LIKE $1', ['%' + partname.toLowerCase() + '%'],
            (error, results) => {
                if (error) {
                    throw error;
                } else {
                    response.status(200).json({status: "success", message: results.rows});
                }
            });
    } else if (vendor !== undefined) {
        pool.query('SELECT * FROM internalcomponents WHERE lower(vendor) LIKE $1', ['%' + vendor.toLowerCase() + '%'],
            (error, results) => {
            if (error) {
                throw error;
            } else {
                response.status(200).json({status: "success", message: results.rows});
            }
        });
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

const addPartToComputer = (request, response) => {
    const {servicetag, item} = request.body;

    pool.query('INSERT INTO computerparts(servicetag, componentid) VALUES ($1, $2)', [computerservicetag, item],
        (error, results) => {
            if (error) {
                throw error;
            } else {
                response.status(201).json({status: "success", message: "added part to computer"});
            }
        });
}

const getComputerParts = (request, response) => {
    const {computerservicetag} = request.query;
    pool.query('select * from computerparts inner join internalcomponents on internalcomponents.id = computerparts.componentid where servicetag = $1', [computerservicetag],
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

app.route('/newpart').post(addPartToComputer).get(getComputerParts);

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/web/index.html'));
});

//Startup REST API Listener on Port 3000
app.listen(3000, () => {
    console.log("Listening on port 3000");
});
