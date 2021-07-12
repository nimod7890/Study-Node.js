var http = require('http');
var fs = require('fs');
var qs=require('querystring');
var template=require('./template.js');
//var path=require('path');
//var sanitizeHTML = require('sanitize-html');

var app = http.createServer(function(request, response) {
  var varUrl = request.url; // ?id=HTML
  var myURL = new URL('http://localhost:3000' + varUrl); // http://localhost......TML
  var queryData = myURL.searchParams.get('id'); // HTML
  var title = queryData;
  var pathName = myURL.pathname;
  var control = `<a href="/create">create</a>  
                <a href="/edit?id=${title}">edit</a>
                <form action="/delete_process" method="post">
                  <input type="hidden" name="id" value="${title}">
                  <input type="submit" value="delete">
                </form>`;

  if(pathName === '/'){
    //var filteredId=path.parse(queryData).base;
    fs.readFile(`practice/${queryData}`, 'utf8', function(err, body) {
      fs.readdir(`./practice`, function(error, filelist){
        if(queryData===null){
          title = 'WEB';
          body='Main Page';
          control= `<a href="/create">create</a>`;

        }
        //title=sanitizeHTML(title);
        //body=sanitizeHTML(body);
        var html = template.html(title, template.List(filelist), 
            `<h2>${title}</h2><p>${body}</p>`,control);
        response.writeHead(200);
        response.end(html);
      });
    });     
  }else if(pathName ==='/create'){
    fs.readdir('./practice',function(error,fileList){
      var title= 'create';
      var html=template.html(title,template.List(fileList),`
        <form action="/create_process" method="post">
          <p><input type='text' name="title" placeholder="title"></p>
          <p><textarea name="description" placeholder="description"></textarea></p>
          <p><input type='submit'></p>
        </form>
      `,` `);
      response.writeHead(200);
      response.end(html);
    });
  }else if(pathName==='/create_process'){
    var body='';
    request.on('data',function(data){
      body+=data;
    });
    request.on('end',function(){
      var post=qs.parse(body);
      var title=post.title;
      var description=post.description;
      fs.writeFile(`practice/${title}`,description,'utf8',function(err){
        response.writeHead(302,{Location:`/?id=${title}`});
        response.end('sucess'); 
      });
    });
  }else if(pathName==='/edit'){
    //var filteredId=path.parse(queryData).base;
    fs.readFile(`practice/${queryData}`, 'utf8', function(err, body) {
      fs.readdir(`./practice`, function(error, filelist){
        var html = template.html(title, template.List(filelist), 
          `<form action="/edit_process" method="post">
            <input type="hidden" name="id" value="${title}">
            <p><input type='text' name="title" placeholder="title" value="${title}"></p>
            <p><textarea name="description" placeholder="description">${body}</textarea></p>
            <p><input type='submit'></p>
          </form>`,control);
        response.writeHead(200);
        response.end(html);
      });
    });  
  }else if(pathName==='/edit_process'){
    var body='';
    request.on('data',function(data){
      body+=data;
    });
    request.on('end',function(){
      var post=qs.parse(body);
      var id=post.id;
      var title=post.title;
      var description=post.description;
      fs.rename(`practice/${id}`,`practice/${title}`,function(error){
        fs.writeFile(`practice/${title}`,description,'utf8',function(err){
          response.writeHead(302,{Location:`/?id=${title}`});
          response.end('sucess'); 
        });
      });      
    });
  }else if(pathName==='/delete_process'){
    var body='';
    request.on('data',function(data){
      body+=data;
    });
    request.on('end',function(){
      var post=qs.parse(body);
      var id=post.id;
      //var filteredId=path.parse(id).base;
      fs.unlink(`practice/${id}`,function(error){
        response.writeHead(302,{Location:'/'});
        response.end();
      });
    });
  }else{
    response.writeHead(404);
    response.end('Not found');
  };

});
app.listen(3000);