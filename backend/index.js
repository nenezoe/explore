const isProduction = process.env.NODE_ENV == "production";
((
  domainName,
  httpPort,
  httpsPort,
  MySQLHost,
  MySQLUsername,
  MySQLUserPassword,
  MySQLDatabaseName
) => {
  global.appData = {
    domainName,
    isProduction,
  };
  global.saltRounds = 10;
  global.generalSessionDomain = "." + domainName;
  global.generalCookie = {
    path: "/",
    httpOnly: true,
    expires: new Date(253402300000000),
    domain: generalSessionDomain,
  };
  let fs = require("fs"),
    mysql = require("mysql"),
    bcrypt = require("bcrypt"),
    cookie = require("cookie"),
    express = require("express"),
    path = require("path"),
    http = require("http");
  let cookieParser = require("cookie-parser");
  const COOKIE_SECRET = "config.session.secret";
  let compression = require("compression");
  var proxy = require("express-http-proxy");
  const qs = require("qs");
  const { Worker } = require("worker_threads");
  //npm install --save express cookie-parser compression express-http-proxy mysql
  const con = mysql.createConnection({
    host: MySQLHost,
    user: MySQLUsername,
    password: MySQLUserPassword,
  });

  con.connect(function (err) {
    if (!!err) {
      console.log("err 0", err);
    } else {
      con.query(
        `CREATE DATABASE IF NOT EXISTS ${MySQLDatabaseName};`,
        function (
          err,
          { affectedRows = 0, warningCount = 1, protocol41 = false } = {}
        ) {
          if (err) {
            console.log("err 1", err);
          } else {
            con.query(
              `CREATE TABLE IF NOT EXISTS \`${MySQLDatabaseName}\`.\`user\` ( 
                  \`uuid\` VARCHAR(40) NOT NULL 
                  , \`firstName\` VARCHAR(20) NOT NULL 
                  , \`lastName\` VARCHAR(20) NOT NULL 
                  , \`group\` VARCHAR(20) NOT NULL 
                  , \`username\` VARCHAR(20) NOT NULL 
                  , \`password\` VARCHAR(70) NOT NULL 
                  , PRIMARY KEY (\`uuid\`), UNIQUE (\`username\`)) ENGINE = InnoDB;`,
              function (err, result) {
                console.log("result 2", result);
                const {
                  affectedRows = 0,
                  warningCount = 1,
                  protocol41 = false,
                } = result || {};
                if (err) {
                  console.log("err 2", err);
                } else {
                  bcrypt.hash(
                    "one.admin.two.three",
                    saltRounds,
                    function (err1, firstUserPasswordHash) {
                      bcrypt.hash(
                        "one.user.two.three",
                        saltRounds,
                        function (err2, secondUserPasswordHash) {
                          if (err1 || err2) {
                            console.log(
                              "Attempt to hash passwords failed ,err1,err2",
                              err1,
                              err2,
                            );
                          } else {
                            con.query(
                              `INSERT INTO \`${MySQLDatabaseName}\`.\`user\` (\`uuid\`, \`firstName\`, \`lastName\`, \`group\`, \`username\`, \`password\`) VALUES ('3cfbfd84-cdc4-41bb-b92c-ccd0687d0338', 'Fulano', 'Admin', 'admin', 'admin', '${firstUserPasswordHash}'), ('0b6a3eaf-58de-43b1-9a5a-c0be8745e167', 'Mengano', 'User', 'user', 'user', '${secondUserPasswordHash}');`,
                              function (err, result) {
                                if (err) {
                                  console.log(
                                    "Attempt to duplicate Default users failed ,err",
                                    err
                                  );
                                } else {
                                  console.log(
                                    "Default users inserted successfully"
                                  );
                                }
                              }
                            );
                          }
                        }
                      );
                    }
                  );
                }
                if (affectedRows === 0 && warningCount === 1 && !!protocol41) {
                  console.log("Table (user) aready exist");
                }
              }
            );

            con.query(
              `CREATE TABLE IF NOT EXISTS \`${MySQLDatabaseName}\`.\`session\` ( 
                \`id\` INT NOT NULL AUTO_INCREMENT , 
                \`status\` VARCHAR(10) NOT NULL ,  
                \`d1\` VARCHAR(10) NOT NULL , 
                \`d2\` VARCHAR(10) NOT NULL , 
                \`loginTime\` VARCHAR(100) NOT NULL , 
                \`logoutTime\` VARCHAR(100) NOT NULL , 
                \`uuid\` VARCHAR(40) NOT NULL , PRIMARY KEY (\`id\`)) ENGINE = InnoDB;`,
              function (err, result) {
                console.log("result 2", result);
                const {
                  affectedRows = 0,
                  warningCount = 1,
                  protocol41 = false,
                } = result || {};
                if (err) {
                  console.log("err 4", err);
                }
                if (affectedRows === 0 && warningCount === 1 && !!protocol41) {
                  console.log("Table (session) aready exist");
                }
              }
            );
          }
          if (affectedRows === 0 && warningCount === 1 && !!protocol41) {
            console.log(`Database (${MySQLDatabaseName}) aready exist`);
          }
        }
      );
    }
  });
  let app = express();
  app.use(compression());
  app.use(express.json());
  app.use(
    express.urlencoded({
      extended: false,
    })
  );
  app.use((req, res, next) => {
    res.removeHeader("x-powered-by");
    next();
  });
  app.use(cookieParser(COOKIE_SECRET));
  app.set("views", path.join(__dirname, "views"));
  app.use(express.static(path.join(__dirname, "public"), { maxAge: "10d" }));
  app.set("http_port", httpPort);
  let httpServer = http.createServer(app);
  httpServer.listen(app.get("http_port"), () => {
    console.log("httpServer listening on port %d", app.get("http_port"));
  });
  let primaryFolder = "react_build";
  let reactBuildDirectory = `${process.cwd()}/${primaryFolder}`;
  let reactBuildIndex = reactBuildDirectory + "/index.html";
  let reactBuildProxyUrl = "localhost:3000";
  const isValidUsername = (username) => {
    if (typeof username == "string") {
      return /^(?=.{3,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/.test(
        username
      );
    }
    return false;
  };
  const randomString = function (length) {
    if (!length) {
      length = 6;
    }
    var text = "";
    var possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };
  app.use((req, res, next) => {
    let {
      sessionId = "",
      d1 = "",
      d2 = "",
    } = !!req.headers.cookie
      ? cookie.parse(req.headers.cookie)
      : req.cookies || {};
    if (isNaN(sessionId)) {
      req.processingMessage = "Sesion identifier not valid";
      next();
    } else if (!isValidUsername(d1)) {
      req.processingMessage = "Sesion identifier 1 not valid";
      next();
    } else if (!isValidUsername(d2)) {
      req.processingMessage = "Sesion identifier 2 not valid";
      next();
    } else {
      con.query(
        `SELECT * FROM \`${MySQLDatabaseName}\`.\`session\` WHERE id = '${sessionId}' AND status = 1 AND d1 = '${d1}' AND d2 = '${d2}' LIMIT 1`,
        function (err, sessions) {
          if (err) {
            req.processingMessage =
              "Error occurred when server made attempt to check session records";
            next();
          } else {
            if (Array.isArray(sessions)) {
              if (sessions.length === 1 && sessions[0] && sessions[0].uuid) {
                con.query(
                  `SELECT * FROM \`${MySQLDatabaseName}\`.\`user\` WHERE uuid = '${sessions[0].uuid}' LIMIT 1`,
                  function (err, users) {
                    if (err) {
                      req.processingMessage =
                        "Error occurred when server made attempt to check records";
                      next();
                    } else {
                      if (Array.isArray(users)) {
                        if (users.length === 1) {
                          req.user = users[0] || {};
                          req.processingMessage = "Welcome back!";
                          next();
                        } else {
                          req.processingMessage =
                            "Session found but no user matched the identifier";
                          next();
                        }
                      } else {
                        req.processingMessage =
                          "Session found but no users failed to respond properly";
                        next();
                      }
                    }
                  }
                );
              } else {
                req.processingMessage = "No session matched the query";
                next();
              }
            } else {
              req.processingMessage = "Session failed to respond properly";
              next();
            }
          }
        }
      );
    }
  });
  app.get("/profile", (req, res, next) => {
    if (!!req && !!req.user && !!req.user.uuid) {
      delete req.user.password;
      res.status(200).json({
        success: true,
        user: req.user,
        message: req.processingMessage,
      });
    } else {
      res.status(500).json({
        success: false,
        message: req.processingMessage,
      });
    }
  });
  app.put("/profile/name", (req, res, next) => {
    const { firstName, lastName } = req.body || {};
    if (!!req && !!req.user && !!req.user.uuid) {
      if (!firstName || `${firstName}`.length < 3) {
        res.status(400).json({
          success: false,
          message: `Please provide valid first name with at least three(3) characters`,
        });
      } else if (`${firstName}`.length > 20) {
        res.status(400).json({
          success: false,
          message: `Valid first name must not exceed 20 characters`,
        });
      } else if (!lastName || `${lastName}`.length < 3) {
        res.status(400).json({
          success: false,
          message: `Please provide valid last name with at least three(3) characters`,
        });
      } else if (`${lastName}`.length > 20) {
        res.status(400).json({
          success: false,
          message: `Valid last name must not exceed 20 characters`,
        });
      } else {
        con.query(
          `UPDATE \`${MySQLDatabaseName}\`.\`user\` SET \`firstName\` = '${firstName}'
          , \`lastName\` = '${lastName}'
           WHERE \`${MySQLDatabaseName}\`.\`user\`.\`uuid\` = '${req.user.uuid}';`,
          function (err, result) {
            if (err) {
              console.log("Name update err", err);
              res.status(500).json({
                success: false,
                message: "Error occurred during name update",
              });
            } else {
              const { affectedRows, protocol41, warningCount } = result || {};
              delete req.user.password;
              if (affectedRows === 1) {
                res.status(200).json({
                  success: true,
                  user: { ...(req.user || {}), firstName, lastName },
                  message: "Name changed succesfully",
                });
              } else {
                res.status(200).json({
                  success: true,
                  user: { ...(req.user || {}), firstName, lastName },
                  message:
                    "Name seems unchanged but procedure completed seamlessly",
                });
              }
            }
          }
        );
      }
    } else {
      res.status(400).json({
        success: false,
        message: `You need to be authenticated to request for name change`,
      });
    }
  });
  app.put("/profile/password", (req, res, next) => {
    const { oldPassword, newPassword, confirmNewPassword } = req.body || {};
    if (!!req && !!req.user && !!req.user.uuid) {
      if (!oldPassword || `${oldPassword}`.length <= 0) {
        res.status(400).json({
          success: false,
          message: "Old password provided is invalid",
        });
      } else if (!newPassword || `${newPassword}`.length < 8) {
        res.status(400).json({
          success: false,
          message: "New password cannot be less than 8 valid characters",
        });
      } else if (`${newPassword}`.length >= 50) {
        res.status(400).json({
          success: false,
          message: "New password cannot be more than 50 valid characters",
        });
      } else if (`${newPassword}` !== `${confirmNewPassword}`) {
        res.status(400).json({
          success: false,
          message: "New password must match confirm new password field",
        });
      } else if (`${newPassword}` === `${oldPassword}`) {
        res.status(400).json({
          success: false,
          message: "New password provided is same as old password provided",
        });
      } else {
        bcrypt.hash(
          newPassword,
          saltRounds,
          function (err2, hashedNewPassword) {
            if (err2) {
              res.status(500).json({
                success: false,
                message: "Error occurred while hashing passwords",
              });
              console.log("Attempt to hash passwords failed ,err2", err2);
            } else {
              bcrypt.compare(
                oldPassword,
                req.user.password,
                function (err, passwordIsEqual) {
                  if (!!passwordIsEqual) {
                    con.query(
                      `UPDATE \`${MySQLDatabaseName}\`.\`user\` SET \`password\` = '${hashedNewPassword}'
                           WHERE \`${MySQLDatabaseName}\`.\`user\`.\`uuid\` = '${req.user.uuid}';`,
                      function (err, result) {
                        if (err) {
                          console.log("Password update err", err);
                          res.status(500).json({
                            success: false,
                            message: "Error occurred during password update",
                          });
                        } else {
                          const { affectedRows, protocol41, warningCount } =
                            result || {};
                          delete req.user.password;
                          if (affectedRows === 1) {
                            res.status(200).json({
                              success: true,
                              user: req.user,
                              message: "Password changed succesfully",
                            });
                          } else {
                            res.status(200).json({
                              success: true,
                              user: req.user,
                              message:
                                "Password seems unchanged but procedure completed seamlessly",
                            });
                          }
                        }
                      }
                    );
                  } else {
                    res.status(400).json({
                      success: false,
                      message: "Old password provided is not correct",
                    });
                  }
                }
              );
            }
          }
        );
      }
    } else {
      res.status(400).json({
        success: false,
        message: `You need to be authenticated to request for name change`,
      });
    }
  });
  app.get("/logout", (req, res, next) => {
    res
      .cookie("sessionId", "", generalCookie)
      .cookie("d1", "", generalCookie)
      .cookie("d2", "", generalCookie)
      .redirect("/");
  });
  app.post("/login", (req, res, next) => {
    const { username, password } = req.body || {};
    if (!username || !isValidUsername(username)) {
      res
        .status(400)
        .json({ success: false, message: "Invalid username specified" });
    } else if (!password || `${password}`.length < 8) {
      res.status(400).json({
        success: false,
        message: "Password cannot be less than 8 valid characters",
      });
    } else if (`${password}`.length >= 50) {
      res.status(400).json({
        success: false,
        message: "Password cannot be more than 50 valid characters",
      });
    } else {
      con.query(
        `SELECT * FROM \`${MySQLDatabaseName}\`.\`user\` WHERE username = '${username}' LIMIT 1`,
        function (err, users) {
          if (err) {
            res.status(500).json({
              success: false,
              message:
                "Error occurred when server made attempt to check records",
            });
          } else {
            if (Array.isArray(users)) {
              if (users.length === 1) {
                let user = users[0] || {};
                bcrypt.compare(
                  password,
                  user.password,
                  function (err, passwordIsEqual) {
                    if (!!passwordIsEqual) {
                      const d1 = randomString(10);
                      const d2 = randomString(10);
                      const loginTime = new Date().toString();
                      const logoutTime = "";
                      // status 0:inactive, 1: active
                      con.query(
                        `INSERT INTO \`${MySQLDatabaseName}\`.\`session\` (\`id\`, \`status\`, \`d1\`, \`d2\`, \`loginTime\`, \`logoutTime\`, \`uuid\`) VALUES (NULL, '1', '${d1}', '${d2}', '${loginTime}', '${logoutTime}', '${user.uuid}');`,
                        function (err, result) {
                          if (err) {
                            res.status(400).json({
                              success: false,
                              message: "Error occured during session insertion",
                            });
                          } else if (!isNaN(result.insertId)) {
                            console.log("result 1", result);
                            delete user.password;
                            res
                              .status(200)
                              .cookie(
                                "sessionId",
                                String(result.insertId),
                                generalCookie
                              )
                              .cookie("d1", String(d1), generalCookie)
                              .cookie("d2", String(d2), generalCookie)
                              .json({
                                success: true,
                                message: "You are now logged in",
                                user,
                              });
                          } else {
                            res.status(400).json({
                              success: false,
                              message: "No insertion reference provided",
                            });
                          }
                        }
                      );
                    } else {
                      res.status(400).json({
                        success: false,
                        message: "Sorry, password is incorrect",
                      });
                    }
                  }
                );
              } else {
                res.status(400).json({
                  success: false,
                  message: "Sorry, username is incorrect",
                });
              }
            } else {
              res.status(500).json({
                success: false,
                message:
                  "Server cannot get users from database but it isn't a major(known) error",
              });
            }
          }
        }
      );
    }
  });
  app.use((req, res, next) => {
    if (req.originalUrl.includes(".map")) {
      return res.json({});
    } else if (req.originalUrl.includes(".ico")) {
      let filePath = `${path.normalize("./public/")}favicon.png`;
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        return fs.createReadStream(filePath).pipe(res);
      } else {
        return res.json({});
      }
    } else if (appData.isProduction) {
      fs.access(reactBuildDirectory, fs.F_OK, (folderError) => {
        if (folderError) {
          return res.send(
            `<h1>Neccessary Folder for React build Not Found</hi>`
          );
        } else {
          //folder exists
          req.reactBuildDirectoryExist = true;
          if (req.exemptCache) {
            next();
          } else {
            return express.static(path.join(process.cwd(), primaryFolder), {
              maxAge: "10d",
            })(req, res, next);
          }
        }
      });
    } else {
      //should do proxy
      //next();
      proxy(reactBuildProxyUrl, {
        preserveHostHdr: true,
        proxyErrorHandler: (err, res, next) => {
          next();
        },
        userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
          //(proxyRes.headers['content-type'] || '').includes('text/html')
          if (
            req.exemptCache ||
            (proxyRes.headers["content-type"] || "").includes("text/html")
          ) {
            return proxyResData.toString("utf8");
          }
          return proxyResData;
        },
      })(req, res, next);
    }
  });
})(
  isProduction ? "alivirtual.com" : "naijadevs.xyz", // domainName
  isProduction ? 4000 : 80, // httpPort
  isProduction ? 4001 : 443, // httpsPort
  isProduction ? "127.0.0.1" : "127.0.0.1", // MySQLHost,
  isProduction ? "root" : "root", // MySQLUsername,
  isProduction ? "" : "", // MySQLUserPassword,
  isProduction ? "better_products" : "better_products_play6" // MySQLDatabaseName
);
