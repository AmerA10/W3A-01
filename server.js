const path = require("path");
const express = require("express");
const app = express();
const supa = require("@supabase/supabase-js");

const supaURL = process.env.supaURL;
const supaKey = process.env.supaKey;
const supabase = supa.createClient(supaURL, supaKey);

const checkError = (data, error, req, resp) => {
  if (error) {
    errorHandler(error, req, resp, "Database Error");
    return true;
  }

  if (data.length == 0 || data == null) {
    errorHandler(error, req, resp, "Not Found");
    return true;
  }

  return false;
};

const errorHandler = (err, req, resp, msg) => {
  console.log(err);
  resp.setHeader("Content-Type", "application/json");
  resp.status(400);
  if (err) {
    resp.send(JSON.stringify(`${msg}: ${err.message}`));
  } else {
    resp.send(JSON.stringify(msg));
  }
};

//TODO: Add Error Checking for not found handles

app.get("/api/seasons", async (req, resp) => {
  const { data, error } = await supabase.from("seasons").select();

  if (checkError(data, error, req, resp)) {
    return;
  }

  resp.send(data);
});
app.get("/", async(req,resp) => {
  errorHandler(null,req,resp, "Check Read me file for API calls available");
  return;
  
});
app.get("/api/", async(req,resp) => {
  errorHandler(null,req,resp, "Check Read me file for API calls available");
  return;
  
});

app.get("/api/circuits", async (req, resp) => {
  const { data, error } = await supabase.from("circuits").select();
  if (checkError(data, error, req, resp)) {
    return;
  }
  resp.send(data);
});

app.get("/api/constructors", async (req, resp) => {
  const { data, error } = await supabase.from("constructors").select();

  if (checkError(data, error, req, resp)) {
    return;
  }

  resp.send(data);
});

app.get("/api/constructors/:ref", async (req, resp) => {
  const { data, error } = await supabase
    .from("constructors")
    .select("*")
    .eq("constructorRef", req.params.ref.toLowerCase());

  if (checkError(data, error, req, resp)) {
    return;
  }

  resp.send(data);
});

app.get("/api/drivers", async (req, resp) => {
  const { data, error } = await supabase.from("drivers").select();
  resp.send(data);
});

app.get("/api/drivers/:ref", async (req, resp) => {
  const { data, error } = await supabase
    .from("drivers")
    .select()
    .eq("driverRef", req.params.ref.toLowerCase());
  if (checkError(data, error, req, resp)) {
    return;
  }
  resp.send(data);
});

app.get("/api/drivers/search/:substring", async (req, resp) => {
  const re = new RegExp(`^${req.params.substring}`, "i");

  const { data, error } = await supabase
    .from("drivers")
    .select("surname")
    .ilike("surname", `%${req.params.substring}%`);

  let filteredData = data.filter((d) => {
    return re.test(d.surname);
  });

  if (checkError(data, error, req, resp)) {
    return;
  }

  resp.send(filteredData);
});

app.get("/api/drivers/race/:raceId", async (req, resp) => {
  
  
  if (!Number.isInteger(req.params.raceId)) {
    errorHandler(null, req, resp, "raceId should be a number");
    return;
  }
  
  const { data, error } = await supabase
    .from("drivers")
    .select(`*, qualifying!inner()`)
    .eq("qualifying.raceId", req.params.raceId);

  if (checkError(data, error, req, resp)) {
    return;
  }
  resp.send(data);
});

app.get("/api/circuits/:ref", async (req, resp) => {
  const { data, error } = await supabase
    .from("circuits")
    .select("*")
    .eq("circuitRef", req.params.ref.toLowerCase())
    .limit(1);

  if (checkError(data, error, req, resp)) {
    return;
  }
  resp.send(data);
});

app.get("/api/circuits/season/:year", async (req, resp) => {
  const { data, error } = await supabase
    .from("circuits")
    .select(`circuitId, races!inner()`)
    .eq(`races.year`, req.params.year)
    .order("circuitId", { ascending: false })
    .order("round", { referencedTable: "races", ascending: true });

  if (checkError(data, error, req, resp)) {
    return;
  }

  resp.send(data);
});

app.get("/api/races/:raceId", async (req, resp) => {
  
  if (!Number.isInteger(req.params.raceId)) {
    errorHandler(null, req, resp, "raceId should be a number");
    return;
  }
  
  
  const { data, error } = await supabase
    .from("races")
    .select(
      "raceId,year,round,name,date,time,url,fp1_date,fp1_time,fp2_date,fp2_time,fp3_date,fp3_time,quali_date,quali_time,sprint_date,sprint_time,circuits( name, location, country )"
    )
    .eq("raceId", req.params.raceId);

  if (checkError(data, error, req, resp)) {
    return;
  }
  resp.send(data);
});

app.get("/api/races/season/:year", async (req, resp) => {
  const { data, error } = await supabase
    .from("races")
    .select("*")
    .eq("year", req.params.year)
    .order("round", { ascending: true });

  if (checkError(data, error, req, resp)) {
    return;
  }
  resp.send(data);
});

app.get("/api/races/season/:year/:round", async (req, resp) => {
  const { data, error } = await supabase
    .from("races")
    .select("*")
    .eq("year", req.params.year)
    .eq("round", req.params.round);

  if (checkError(data, error, req, resp)) {
    return;
  }
  resp.send(data);
});

app.get("/api/races/circuits/:ref", async (req, resp) => {
  const { data, error } = await supabase
    .from("races")
    .select("*, circuits!inner()")
    .eq("circuits.circuitRef", req.params.ref.toLowerCase())
    .order("year", { ascending: true });

  if (checkError(data, error, req, resp)) {
    return;
  }
  resp.send(data);
});

app.get("/api/races/circuits/:ref/season/:start/:end", async (req, resp) => {
  if (req.params.end < req.params.start) {
    errorHandler(
      null,
      req,
      resp,
      "End Date must be more than or equal to start date"
    );
    return;
  }
  const { data, error } = await supabase
    .from("races")
    .select("*, circuits!inner()")
    .eq("circuits.circuitRef", req.params.ref.toLowerCase())
    .gte("year", req.params.start)
    .lte("year", req.params.end);

  if (checkError(data, error, req, resp)) {
    return;
  }
  resp.send(data);
});

app.get("/api/results/:raceId", async (req, resp) => {

  const { data, error } = await supabase
    .from("results")
    .select(
      "resultId,number,grid,position, positionText,positionOrder,points, laps,time,milliseconds,fastestLap,rank,fastestLapTime,fastestLapSpeed, drivers(driverRef, code, forename, surname), races(name, round, year, date), constructors(name, constructorRef, nationality)"
    )
    .eq("raceId", req.params.raceId)
    .order("grid", { ascending: true });

  if (checkError(data, error, req, resp)) {
    return;
  }
  resp.send(data);
});

app.get("/api/results/driver/:ref", async (req, resp) => {
  const { data, error } = await supabase
    .from("results")
    .select("*, drivers!inner()")
    .eq("drivers.driverRef", req.params.ref.toLowerCase());

  if (checkError(data, error, req, resp)) {
    return;
  }

  resp.send(data);
});

app.get("/api/results/driver/:ref/seasons/:start/:end", async (req, resp) => {
  if (req.params.end < req.params.start) {
    errorHandler(
      null,
      req,
      resp,
      "End Date must be more than or equal to start date"
    );
    return;
  }

  const { data, error } = await supabase
    .from("results")
    .select("*, drivers!inner(), races!inner()")
    .gte("races.year", req.params.start)
    .lte("races.year", req.params.end)
    .eq("drivers.driverRef", req.params.ref.toLowerCase());

  if (checkError(data, error, req, resp)) {
    return;
  }
  resp.send(data);
});

app.get("/api/qualifying/:raceId", async (req, resp) => {

  const { data, error } = await supabase
    .from("qualifying")
    .select(
      "qualifyId,number,position,q1,q2,q3 ,drivers(driverRef, code, forename, surname), races(name, round, year, date), constructors(name, constructorRef, nationality)"
    )
    .eq("raceId", req.params.raceId)
    .order("position", { ascending: true });

  if (checkError(data, error, req, resp)) {
    return;
  }
  resp.send(data);
});

app.get("/api/standings/:raceId/drivers", async (req, resp) => {


  const { data, error } = await supabase
    .from("driver_standings")
    .select(
      "driverStandingsId, races(name,round,year,date),points,position,positionText,wins,drivers(driverRef, code,forename,surname)"
    )
    .eq("raceId", req.params.raceId);

  if (checkError(data, error, req, resp)) {
    return;
  }
  resp.send(data);
});

app.get("/api/standings/:raceId/constructors", async (req, resp) => {

  const { data, error } = await supabase
    .from("constructor_standing")
    .select(
      "constructorStandingsId,points,position,positionText,wins,races(name,round,year,date), constructors(name, constructorRef, nationality)"
    )
    .eq("raceId", req.params.raceId);

  if (checkError(data, error, req, resp)) {
    return;
  }
  resp.send(data);
});

// Run the server and report out to the logs
const listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
