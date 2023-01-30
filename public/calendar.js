document.addEventListener("DOMContentLoaded", () =>
    {
        var calendarEl = document.getElementById("calendar");

        let db_events = $(".events").attr("value");
        db_events = JSON.parse(db_events);

        let calendar = new FullCalendar.Calendar(calendarEl, 
            {
                themeSystem: "bootstrap5",
                initialView: "dayGridMonth",
                headerToolbar: 
                {
                    left: "title",
                    right: "prev next",
                },
                buttonIcons: 
                {
                    prev: "arrow-left-short",
                    next: "arrow-right-short",
                },
                events: db_events,
                dateClick: (info) => 
                {
                    const day = info.date.toString().slice(0, 3);

                    var check = info.dateStr.slice(0, 10);
                    var today = new Date().toISOString().split('T')[0];

                    if((day !== "Sun") && (check > today))
                    {
                        $("#scheduling-modal").modal("toggle");
                    }
                    // else if (check === today)
                    // {
                    //     alert("Same day scheduling is not allowed");
                    // }
                    
                    const date_title = info.date.toString().slice(0, 10);

                    $(".form-submit").attr("value", info.dateStr);

                    $(".modal-title").text(date_title);

                    if(day.slice(0, 3) === "Sat")
                    {
                        $(".weekday").addClass("hide-content");
                        $(".weekend").removeClass("hide-content");
                    }
                    else
                    {
                        $(".weekend").addClass("hide-content");
                        $(".weekday").removeClass("hide-content");
                    }


                    // ON CHANGE ////////////////////////////////////////////////////
                    $(".form-select").on("change", (event) =>
                    {
                        const wd_availableT = 
                        [
                            "8:00am-9:30am", 
                            "9:30am-11:00am", 
                            "11:00am-12:30pm", 
                            "12:30pm-02:00pm", 
                            "02:00pm-03:30pm",
                            "03:30pm-05:00pm"
                        ];

                        const we_availableT = ["9:00am-10:30am", "10:30am-12:00pm"];

                        let availableT = "";

                        db_events.forEach((event) => 
                        {
                            // if((event.start === info.dateStr) && (event.extendedProps.time === selected_time))
                            if(event.start === info.dateStr)
                            {
                                if(day !== "Sat")
                                {
                                    wd_availableT.forEach((time) =>
                                    {
                                        if(time === event.extendedProps.time)
                                        {
                                            const index = wd_availableT.indexOf(time);

                                            if (index > -1) 
                                            { 
                                                wd_availableT.splice(index, 1);
                                            }
                                        }
                                    });

                                    availableT = "the selected time is not available! Try " + wd_availableT.join(', ').replace(/,([^,]*)$/, ' or$1');
                                }
                                else if(day === "Sat")
                                {
                                    we_availableT.forEach((time) =>
                                    {
                                        if(time === event.extendedProps.time)
                                        {
                                            const index = we_availableT.indexOf(time);

                                            if (index > -1) 
                                            { 
                                                we_availableT.splice(index, 1);
                                            }
                                            
                                        }
                                    });

                                    availableT = "the selected time is not available! Try " + we_availableT.join(', ').replace(/,([^,]*)$/, ' or$1');
                                }

                                
                            }
                        });

                        // If there are no available times
                        if (availableT === "the selected time is not available! Try ")
                        {
                            availableT = "we're fully booked on this date. Try a different date :)";
                        }

                        $(".schedule-warning").remove();

                        $(".form-submit").css("pointer-events", "auto"); 

                        // When the form is closed
                        $(".btn-close").click(() =>
                        {
                            $("#schedule-form")[0].reset();

                            $(".schedule-warning").remove();

                            $(".form-submit").css("pointer-events", "auto");
                        });
                        
                        // if the time selected is not available and some times are not available
                        if((!availableT.includes(event.target.value)) && availableT !== "")
                        {
                            $("select.weekend").after("<p class='schedule-warning'>Sorry, " + availableT + "</p>");

                            $(".form-submit").css("pointer-events", "none");

                            $(".form-submit").before("<p class='schedule-warning'>You must select a valid time before form submission</p>");
                        }
                    });
                }
            });

            calendar.render();

            // let _prompt = prompt("What day do you want to check?", "2023-01-12T10:50:00-0500");

            setInterval(() =>
            {
                $(".robot-load").remove();

                // EMPLOYEE VIEW
                const apts_today = [];

                // const _date = new Date(_prompt);
                const _date = new Date();

                // Get year, month, and day part from the date
                var _year = _date.toLocaleString("default", { year: "numeric" });
                var _month = _date.toLocaleString("default", { month: "2-digit" });
                var _day = _date.toLocaleString("default", { day: "2-digit" });
                
                // Generate yyyy-mm-dd date string
                var formattedDate = _year + "-" + _month + "-" + _day;

                db_events.forEach((event) => 
                {
                    if(event.start === formattedDate)
                    {
                        apts_today.push(event);
                    }
                });

                // List of today's appointments
                $(".today_num_apts").text("");
                $(".today_num_apts").text("Today's Appointment(s): " + apts_today.length);

                if(apts_today.length === 0)
                {
                    $(".apt-notif").remove();
                    $(".upcoming-apts div > *").remove();

                    $(".today_num_apts").after("<p class='apt-notif'>Nothing to see here :)");

                    $(".current-apt h2 span").remove();
                    $(".current-apt p").remove();

                    $(".current-apt h2").append(`<span>No current appointment at this time, but you can still preview all of <strong>today's appointment(s)!</strong></span>`);
                }
                else
                {
                    $(".upcoming-apts div > *").remove();
                    $(".apt-notif").remove();

                    let counter = 1; 

                    const apts = apts_today.map((apt) =>
                    {
                        $(".apts-list").append(`<div class="accordion-item">
                                                            <h2 class="accordion-header" id="flush-heading${counter}">
                                                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapse${counter}" aria-expanded="false" aria-controls="flush-collapse${counter}">
                                                                    ${apt.title} (${apt.extendedProps.time})
                                                                </button>
                                                            </h2>
                                                            <div id="flush-collapse${counter}" class="accordion-collapse collapse" aria-labelledby="flush-heading${counter}" data-bs-parent="#accordionFlushExample">
                                                                <div class="accordion-body">
                                                                    <strong>Name:</strong> ${apt.extendedProps.fName} ${apt.extendedProps.lName} <br>
                                                                    <strong>Email:</strong> ${apt.extendedProps.email} <br>
                                                                    <strong>Phone:</strong> ${apt.extendedProps.phone} <br>
                                                                    <strong>Address:</strong> ${apt.extendedProps.address} <br>
                                                                    <strong>Vehicle Year:</strong> ${apt.extendedProps.v_year} <br>
                                                                    <strong>Vehicle Make:</strong> ${apt.extendedProps.v_make} <br>
                                                                    <strong>Vehicle Model:</strong> ${apt.extendedProps.v_model} <br>
                                                                    <strong>Insurance Company:</strong> ${apt.extendedProps.i_company} <br>
                                                                    <strong>Claim Number:</strong> ${apt.extendedProps.i_claim} <br>
                                                                    <strong>Description:</strong> ${apt.extendedProps.desc}
                                                                </div>
                                                            </div>
                                                        </div>`);
                        
                        counter++;
                    });
                }

                // Current time
                let currTime_occupied = false;
                
                apts_today.forEach((apt) => 
                {
                    const time_split = apt.extendedProps.time.split("-");

                    const time_arr = time_split.map((time) =>
                    {
                        if(time.length !== 7)
                        {
                            return "0" + time;
                        }
                        else
                        {
                            return time;
                        }
                    });

                    const militaryT_arr = time_arr.map((time) =>
                    {
                        const standardTime = time;
                        let militaryTime = "";

                        if((standardTime.endsWith("pm")) && (standardTime.slice(0, 2) !== "12")) 
                        {
                            let hour = standardTime.slice(0,2);
                            militaryTime = (parseInt(hour) + 12) + standardTime.slice(2,5);
                        } 
                        else 
                        {
                            militaryTime = standardTime.slice(0,5);
                        }

                        return militaryTime;
                    });

                    var startTime = militaryT_arr[0] + ":00";
                    var endTime = militaryT_arr[1] + ":00";

                    const currentDate = _date;

                    let startDate = new Date(currentDate.getTime());
                    startDate.setHours(startTime.split(":")[0]);
                    startDate.setMinutes(startTime.split(":")[1]);
                    startDate.setSeconds(startTime.split(":")[2]);

                    let endDate = new Date(currentDate.getTime());
                    endDate.setHours(endTime.split(":")[0]);
                    endDate.setMinutes(endTime.split(":")[1]);
                    endDate.setSeconds(endTime.split(":")[2]);

                    const valid = startDate < currentDate && endDate > currentDate;
          
                    if(valid)
                    {
                        currTime_occupied = true;

                        // $(".apts-list h2").removeClass("emphasize-txt");
                        // $(".apts-list h2").addClass("emphasize-txt");

                        $(".current-apt h2 span").remove();
                        $(".current-apt p").remove();

                        $(".current-apt h2").append(`<span class="space-span"><strong>${apt.title.toUpperCase()}</strong></span>`);

                        $(".current-apt").append(`<p>
                                                    <strong>Time:</strong> ${apt.extendedProps.time} <br>
                                                    <strong>Name:</strong> ${apt.extendedProps.fName} ${apt.extendedProps.lName} <br>
                                                    <strong>Email:</strong> ${apt.extendedProps.email} <br>
                                                    <strong>Phone:</strong> ${apt.extendedProps.phone} <br>
                                                    <strong>Address:</strong> ${apt.extendedProps.address} <br>
                                                    <strong>Vehicle Year:</strong> ${apt.extendedProps.v_year} <br>
                                                    <strong>Vehicle Make:</strong> ${apt.extendedProps.v_make} <br>
                                                    <strong>Vehicle Model:</strong> ${apt.extendedProps.v_model} <br>
                                                    <strong>Insurance Company:</strong> ${apt.extendedProps.i_company} <br>
                                                    <strong>Claim Number:</strong> ${apt.extendedProps.i_claim} <br>
                                                    <strong>Description:</strong> ${apt.extendedProps.desc}
                                                </p>`)
                    }
                    else if(!currTime_occupied)
                    {
                        $(".current-apt h2 span").remove();
                        $(".current-apt p").remove();

                        $(".current-apt h2").append(`<span>No current appointment at this time, but you can still preview all of <strong>today's appointment(s)!</strong></span>`);
                    }
                });
            },  60 * 1000);
    });