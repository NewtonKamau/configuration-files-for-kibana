var client = require('./connection.js');
const axios = require('axios');
const indexname = "smsstats";
const mysql = require('mysql');
const { parse } = require('json2csv');
const fs = require('fs');
const path = require('path')
const { execFile, exec } = require('child_process');
const cols = ['col1','col3', 'col4', 'col5', 'col6', 'col7', 'col8', 'col9', 'col10', 'col11', 'col12', 'col13', 'col15'];
const opts = { cols };
const logstashPath = ''
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: "1234",
    database: "test",
    port: 3306

});

(function createIndexAndUploadToKibana() {
    axios.get(`http://localhost:9200/${indexname}`)
        .then(function (response) {
            let mydata = [];
            if (response.status == 200) {
                connection.query('SELECT * from my_stuff', function (error, results, fields) {
                    if (error) throw error;
                    console.log("YAAAY!!", results);

                    results.forEach(element => {

                        mydata.push({...element})
                        //console.log(element.col1);

                    });
                    console.log(mydata);

                    try {
                        const csv = parse(results, opts);
                        const filename = "data"
                        console.log("####" + csv);
                        fs.writeFileSync(`${__dirname}/${filename}.csv`, csv, 'utf-8')
                        const child = exec('./logstash', ['--path.settings logstash/config', '--path.data', '-f', 'logstash/blast.config'], (error, stdout, stderr) => {
                            if (error) {
                                throw error;
                            }
                            console.log(stdout);
                        });
                    } catch (err) {
                        console.error(err);
                    }
                    connection.end(function (err) {
                        console.log(err);
                        // The connection is terminated now
                    });
                    // connected!
                });

            } else {
                console.log("an error occured!!")
            }
       // console.log(response);
    })
        .catch(function (error) {
            if (error.response.status == 404) {
                client.indices.create({ index: `${indexname}` }, function (err, resp, status) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        console.log("create", resp)
                    }

                });

            } else {
                console.log(error.response.status);
            }



        })

    })();
