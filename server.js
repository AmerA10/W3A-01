const path = require("path");
const express = require('express');
const app = express();
const supa = require('@supabase/supabase-js');



const supaURL = process.env.supaURL;
const supaKey = process.env.supaKey;
const supabase = supa.createClient(supaURL,supaKey);

app.get('/api/seasons', async(req,resp) => {
    const {data,error} = await supabase
    .from("seasons")
    .select();
    resp.send(data);
});

app.get('/api/circuits', async(req,resp) => {
    const {data,errror} = await supabase
        .from("circuits")
        .select();
        resp.send(data);

});

app.get('/api/constructors', async(req,resp) => {
    const {data, error} = await supabase
    .from("constructors")
    .select();
    resp.send(data);

});

app.get('/api/constructors/:ref', async(req,resp) => {
  const {data,error} = await supabase
  .from("constructors")
  .select("*")
  .eq("constructorRef", req.params.ref);
  resp.send(data);


});

app.get('/api/drivers', async(req,resp) => {
    const {data, error} = await supabase
    .from("drivers")
    .select();
    resp.send(data);
});

app.get('/api/drivers/:ref', async(req,resp) => {
    const {data, error} = await supabase
    .from("drivers")
    .select()
    .eq('driverRef', req.params.ref);
    resp.send(data);
});

app.get('/api/drivers/search/:substring', async(req,resp) => {
  
    const re = new RegExp(`^${req.params.substring}`, 'i');
  
    const {data, error} = await supabase
    .from("drivers")
    .select('surname')
    .ilike('surname', `%${req.params.substring}%`);
    
    let filteredData = data.filter((d) => {
      return re.test(d.surname);
    
    });
  
    resp.send(filteredData);
});


app.get('/api/drivers/race/:raceId', async(req,resp) => {
  const {data,error} = await supabase
  .from("drivers")
  .select(`*, qualifying!inner()`)
  .eq('qualifying.raceId', req.params.raceId);
  resp.send(data);
  
  
});

app.get('/api/circuits/:ref', async(req,resp) => {
  const {data, error} = await supabase
  .from("circuits")
  .select("*")
  .eq("circuitRef", req.params.ref)
  .limit(1);
  resp.send(data);

});

app.get('/api/circuits/season/:year', async(req,resp) => {
  const {data, error} = await supabase
    .from("circuits")
    .select(`circuitId, races!inner()`)
    .eq(`races.year`, req.params.year)
    .order('circuitId', {ascending:false})
    .order('round', {referencedTable:'races', ascending:true});
    console.log(data);  
    resp.send(data);
  
});

app.get('/api/races/:raceId', async(req,resp) => {
  const {data,error} = await supabase
  .from('races')
  .select('raceId,year,round,name,date,time,url,fp1_date,fp1_time,fp2_date,fp2_time,fp3_date,fp3_time,quali_date,quali_time,sprint_date,sprint_time,circuits( name, location, country )')
  .eq('raceId', req.params.raceId);
  resp.send(data);


});

app.get('/api/races/season/:year', async(req,resp) => {
  const {data,error} = await supabase
  .from('races')
  .select('*')
  .eq('year', req.params.year)
  .order('round', {ascending:true});
  resp.send(data);


});

app.get('/api/races/season/:year/:round', async(req,resp) => {
  const {data,error} = await supabase
  .from('races')
  .select('*')
  .eq('year', req.params.year)
  .eq('round', req.params.round);
  resp.send(data);
  

});

app.get('/api/races/circuits/:ref', async(req,resp) => {
  const {data,error} = await supabase
  .from('races')
  .select('*, circuits!inner()')
  .eq('circuits.circuitRef', req.params.ref)
  .order('year', {ascending:true});
  resp.send(data);
  

});

app.get('/api/races/circuits/:ref/season/:start/:end', async(req,resp) => {
  const {data, error} = await supabase
  .from('races')
  .select('*, circuits!inner()')
  .eq('circuits.circuitRef', req.params.ref)
  .gte('year', req.params.start)
  .lte('year', req.params.end);
  resp.send(data);
  
  
});

app.get('/api/results/:raceId', async(req,resp) => {
  const {data,error} = await supabase
  .from('results')
  .select('resultId,number,grid,position, positionText,positionOrder,points, laps,time,milliseconds,fastestLap,rank,fastestLapTime,fastestLapSpeed, drivers(driverRef, code, forename, surname), races(name, round, year, date), constructors(name, constructorRef, nationality)')
  .eq('raceId', req.params.raceId)
  .order('grid', {ascending:true});
  resp.send(data);
});

app.get('/api/results/driver/:ref', async(req,resp) => {
  const {data,error} = await supabase
  .from('results')
  .select('*, drivers!inner()')
  .eq('drivers.driverRef', req.params.ref);
  resp.send(data);
  
});

app.get('/api/results/driver/:ref/seasons/:start/:end', async(req,resp) => {
  const {data,error} = await supabase
  .from('results')
  .select('*, drivers!inner(), races!inner()')
  .gte('races.year', req.params.start)
  .lte('races.year', req.params.end)
  .eq('drivers.driverRef', req.params.ref);
  resp.send(data);
  
});

app.get('/api/qualifying/:raceId', async(req,resp) => {
  const {data,error} = await supabase
  .from('qualifying')
  .select('qualifyId,number,position,q1,q2,q3 ,drivers(driverRef, code, forename, surname), races(name, round, year, date), constructors(name, constructorRef, nationality)')
  .eq('raceId', req.params.raceId)
  .order('position', {ascending:true});
  resp.send(data);
  
});

app.get('/api/standings/:raceId/drivers', async(req,resp) => {
  const {data,error} = await supabase
  .from('driver_standings')
  .select('driverStandingsId, races(name,round,year,date),points,position,positionText,wins,drivers(driverRef, code,forename,surname)')
  .eq('raceId', req.params.raceId);
  resp.send(data);
});

app.get('/api/standings/:raceId/constructors', async(req,resp) => {
  const {data,error} = await supabase
  .from('constructor_standing')
  .select('constructorStandingsId,points,position,positionText,wins,races(name,round,year,date), constructors(name, constructorRef, nationality)')
  .eq('raceId', req.params.raceId);
  resp.send(data);
});

// Run the server and report out to the logs
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
