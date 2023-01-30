import * as dotenv from 'dotenv'
dotenv.config();
import express from "express";
import ejs from "ejs";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";

const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

main().catch((err) => console.log(err));
async function main()
{
    // Connection to db
    await mongoose.connect("mongodb+srv://admin-johnD:" + process.env.MONGODBATLAS_ADMIN_PWD + "@bumper-control-appointm.rtl1ljy.mongodb.net/bumperglobeDB");

    const aptSchema = new mongoose.Schema({
        title: String,
        start: String,
        end: String,
        extendedProps: 
        {
            time: String,
            fName: String,
            lName: String,
            email: String,
            phone: String,
            address: String,
            v_year: String,
            v_make: String,
            v_model: String,
            i_company: String,
            i_claim: String,
            desc: String
        }
    });

    const Appointment = mongoose.model("Appointment", aptSchema);

    const userSchema = new mongoose.Schema({
        email: String,
        password: String
    });

    userSchema.plugin(passportLocalMongoose);

    const User = mongoose.model("User", userSchema);

    passport.use(User.createStrategy());

    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "bumperglobeclients@gmail.com",
            pass: process.env.GOOGLE_APP_PWD,
        }
        });

    // Home Page
    app.get("/", (req, res) =>
    {
        res.render("home");
    });

    // Services page
    app.get("/services", (req, res) =>
    {
        res.render("services");
    });

    // Tour & Equipment Page
    app.get("/tour-&-equipment", (req, res) =>
    {
        res.render("tour&equipment");
    });

    // Our process Page
    app.get("/our-process", (req, res) =>
    {
        res.render("our-process");
    });

    // About Us Page
    app.get("/about-us", (req, res) =>
    {
        res.render("about-us");
    });

    // Contact Us Page
    app.get("/contact-us", (req, res) =>
    {
        res.render("contact-us");
    });

    app.post("/contact-us", (req, res) =>
    {
        const {fName, lName, email, phone, message} = req.body;

        const info = transporter.sendMail({
            from: "bumperglobeclients@gmail.com",
            to: "bumperglobeclients@gmail.com", //Change to info@bumperglobe.com
            subject: "New Client Inquiry",
            html: `<p><strong>Name:</strong> ${fName} ${lName} <br> 
                    <strong>Email:</strong> ${email} <br>
                    <strong>Phone:</strong> ${phone} <br>
                    <strong>Message:</strong> ${message}</p>`
        }); 

        res.redirect("/contact-us");
    });

    // Gallary Page
    app.get("/gallery", (req, res) =>
    {
        res.render("gallery");
    });

    // FAQ
    app.get("/faq", (req, res) =>
    {
        res.render("faq");
    });

    // Schedule Service (client-end)
    app.get("/schedule-service", (req, res) =>
    {
        Appointment.find({}, (err, apts) => 
        {
            res.render("schedule-service", {db_events: apts});
        }); 
    });

    app.post("/schedule-service", (req, res) =>
    {
        const {time, fName, lName, email, phone, address, v_year, v_make, v_model, i_company, i_claim, desc, date} = req.body;

        const apt = new Appointment({
            title: lName + "'s " + v_model,
            start: date,
            end: date,
            extendedProps:
            {
                time: time[0] === "Select Time"? time[1] : time[0],
                fName: fName,
                lName: lName,
                email: email,
                phone: phone,
                address: address,
                v_year: v_year,
                v_make: v_make,
                v_model: v_model,
                i_company: i_company,
                i_claim: i_claim,
                desc: desc
            }
        });

        apt.save();

        // Send an email confirmation after form submission
        const host = "http://" + req.get("host") + "/cancel-apt";
        
        const info = transporter.sendMail({
            from: "bumperglobeclients@gmail.com", //Change to appropriate sender if needed
            // to: email,
            to: "bumperglobeclients@gmail.com",
            subject: "Bumper Globe: You've Got an Appointment!",
            html: 
                `
                    <!DOCTYPE html>
                        <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">

                        <head>
                            <title></title>
                            <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
                            <!--[if !mso]><!-->
                            <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet" type="text/css">
                            <!--<![endif]-->
                            <style>
                                * {
                                    box-sizing: border-box;
                                }

                                body {
                                    margin: 0;
                                    padding: 0;
                                }

                                a[x-apple-data-detectors] {
                                    color: inherit !important;
                                    text-decoration: inherit !important;
                                }

                                #MessageViewBody a {
                                    color: inherit;
                                    text-decoration: none;
                                }

                                p {
                                    line-height: inherit
                                }

                                .desktop_hide,
                                .desktop_hide table {
                                    mso-hide: all;
                                    display: none;
                                    max-height: 0px;
                                    overflow: hidden;
                                }

                                @media (max-width:550px) {
                                    .desktop_hide table.icons-inner {
                                        display: inline-block !important;
                                    }

                                    .icons-inner {
                                        text-align: center;
                                    }

                                    .icons-inner td {
                                        margin: 0 auto;
                                    }

                                    .row-content {
                                        width: 100% !important;
                                    }

                                    .mobile_hide {
                                        display: none;
                                    }

                                    .stack .column {
                                        width: 100%;
                                        display: block;
                                    }

                                    .mobile_hide {
                                        min-height: 0;
                                        max-height: 0;
                                        max-width: 0;
                                        overflow: hidden;
                                        font-size: 0px;
                                    }

                                    .desktop_hide,
                                    .desktop_hide table {
                                        display: table !important;
                                        max-height: none !important;
                                    }
                                }
                            </style>
                        </head>

                        <body style="background-color: #f3f2f0; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
                            <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f3f2f0;">
                                <tbody>
                                    <tr>
                                        <td>
                                            <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                <tbody>
                                                    <tr>
                                                        <td>
                                                            <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #000000; border-radius: 0; color: #000000; width: 530px;" width="530">
                                                                <tbody>
                                                                    <tr>
                                                                        <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 0px; padding-bottom: 0px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                            <table class="html_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                <tr>
                                                                                    <td class="pad">
                                                                                        <div style="font-family:Roboto, Tahoma, Verdana, Segoe, sans-serif;text-align:center;" align="center"><div style="background-color:#f3f2f0; height:10px"></div>

                        <div class="our-class" style="text-align:center; font-family:system-ui; font-size:14px; padding-top:80px; padding-bottom:60px; padding-right:80px; padding-left:80px">
                        <img src="https://imgur.com/LFuu4QZ.png" alt="bumper globe logo" title="source: imgur.com" style="width:80px;" />

                        <div style="color:white; height:fit-content; margin-top:36px; padding-top:.1px; padding-bottom:30px; padding-left:25px; padding-right:25px;">
                            <p style="font-size:25px; margin-top:15px">
                            <strong>Hello, ${fName}</strong>
                            </p>

                            <p style="margin-top:20px; line-height:2">
                            This is your appointment confirmation for Bumper Globe
                            <br /><br />

                            <strong style="color:#E62E24">WHEN:</strong> ${date} @${time[0] === "Select Time"? time[1] : time[0]}
                            <br />
                            <strong style="color:#E62E24">WHERE:</strong> 1845 S. Hanover St

                            Baltimore, MD 21230

                            <br /><br />
                            We look forward to seeing you and your car!
                            </p>
                        </div>

                        <div style="text-align: center; margin-top:12px; margin-bottom:90px;">
                            <a href=${host} target="_blank">
                            <button style="background-color:#E62E24; color:#ffffff; border-style:none; text-transform:uppercase; font-weight:bold; width:260px; padding: 15px 0; border-radius:50px"> Cancel appointment</button>
                            </a>
                        </div>
                        </div></div>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                <tbody>
                                                    <tr>
                                                        <td>
                                                            <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 530px;" width="530">
                                                                <tbody>
                                                                    <tr>
                                                                        <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                            <table class="icons_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                <tr>
                                                                                    <td class="pad" style="vertical-align: middle; color: #9d9d9d; font-family: inherit; font-size: 15px; padding-bottom: 5px; padding-top: 5px; text-align: center;">
                                                                                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                            <tr>
                                                                                                <td class="alignment" style="vertical-align: middle; text-align: center;">
                                                                                                    <!--[if vml]><table align="left" cellpadding="0" cellspacing="0" role="presentation" style="display:inline-block;padding-left:0px;padding-right:0px;mso-table-lspace: 0pt;mso-table-rspace: 0pt;"><![endif]-->
                                                                                                    <!--[if !vml]><!-->
                                                                                                    <table class="icons-inner" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; display: inline-block; margin-right: -4px; padding-left: 0px; padding-right: 0px;" cellpadding="0" cellspacing="0" role="presentation">
                                                                                                        <!--<![endif]-->
                                                                                                        <tr>
                                                                                                            <td style="vertical-align: middle; text-align: center; padding-top: 5px; padding-bottom: 5px; padding-left: 5px; padding-right: 5px;"><a href="https://www.designedwithbee.com/?utm_source=editor&utm_medium=bee_pro&utm_campaign=free_footer_link" target="_blank" style="text-decoration: none;"><img class="icon" alt="Designed with BEE" src="https://d15k2d11r6t6rl.cloudfront.net/public/users/Integrators/BeeProAgency/53601_510656/Signature/bee.png" height="32" width="34" align="center" style="display: block; height: auto; margin: 0 auto; border: 0;"></a></td>
                                                                                                            <td style="font-family: Roboto, Tahoma, Verdana, Segoe, sans-serif; font-size: 15px; color: #9d9d9d; vertical-align: middle; letter-spacing: undefined; text-align: center;"><a href="https://www.designedwithbee.com/?utm_source=editor&utm_medium=bee_pro&utm_campaign=free_footer_link" target="_blank" style="color: #9d9d9d; text-decoration: none;">Designed with BEE</a></td>
                                                                                                        </tr>
                                                                                                    </table>
                                                                                                </td>
                                                                                            </tr>
                                                                                        </table>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table><!-- End -->
                        </body>

                        </html>
                `
        });    

        res.redirect("/schedule-service");
    });

    // Cancel appointments
    app.get("/cancel-apt", (req, res) =>
    {
        res.render("cancel-apt");
    });

    app.post("/cancel-apt", (req, res) =>
    {
        const email = req.body.email;
        
        Appointment.findOneAndDelete({"extendedProps.email": email}, (err, apt) =>
        {
            if(apt)
            {
                console.log("appointment found and deleted, appointment: " + apt);
            }
            else
            {
                console.log("Something went wrong while trying to delete appointment!");
            }
        });

        res.redirect("/cancel-confirmation");
    });

    // Cancel appointment confirmation 
    app.get("/cancel-confirmation", (req, res) =>
    {
        res.render("cancel-confirmation");
    });

    // Register
    app.get("/register", (req, res) =>
    {
        res.render("register");
    });

    app.post("/register", (req, res) =>
    {
        const {username, password, admin_token} = req.body;

        if(admin_token === process.env.WEB_ADMIN_TOKEN)
        {
            User.register({username: username}, password, (err, user) =>
            {
                if(err)
                {
                    console.log("Error while registering: " + err);
                    
                    res.redirect("/register");
                }
                else 
                {
                    passport.authenticate("local")(req, res, () =>
                    {
                        res.redirect("/appointments");
                    });
                }
            });
        }
        else
        {
            console.log("Invalid Admin Token"); //Change to an alert system

            res.redirect("/register");
        }
    });

    //Appointments page
    app.get("/appointments", (req, res) =>
    {
        if(req.isAuthenticated())
        {
            Appointment.find({}, (err, apts) => 
            {
                res.render("appointments", {db_events: apts});
            }); 
        }
        else
        {
            res.redirect("/login");
        }
    });

    // Login
    app.get("/login", (req, res) =>
    {
        res.render("login");
    });

    app.post("/login", passport.authenticate("local"), (req, res) =>
    {
        const {username, password} = req.body;

        const user = new User({
            username: username,
            password: password
        });

        req.login(user, (err) =>
        {
            if(err)
            {
                console.log(err);
            }
            else
            {
                passport.authenticate("local")(req, res, () =>
                {
                    res.redirect("/appointments");
                });
            }
        });
    });

    // Log out
    app.get("/logout", (req, res, next) =>
    {
        req.session.destroy((err) =>
        {
            res.redirect("/");
        });
    });
}

app.listen(3000, () =>
{
    console.log("Server started on port 3000");
});