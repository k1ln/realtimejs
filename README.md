# realtime.js
Realtime.js is a fast frontend framework based on Web-Components and Proxies. It has a lot of features to simplify your way of live as a vanillajs developer. The framework is programmed in such a way, that you can edit it yourself if you need additional features.
![realtimeJS](https://github.com/k1ln/realtimejs/assets/11948913/ca93de5e-47da-4bab-93a7-a0d19c42d034)

Depending on which clever Web-Components you need the framework renders these components from the Start. 

The framework introduces two different technologies: 
- Proxies => Xvar 
- Web Components => f.e. x-div

If you combine these two technologies you don't  need to care about refreshing UI anymore if everything has been set. 
All you need to do is change Data and the GUI manipulating will occure itself, without any additional react render overhead you cannot debug.

You need a webserver to see the files working. So either you move the extracted zip to an apache or you build the added webserver.go. 
```javascript
  go build webserver.go
``` 
If you start the executable (doesn't matter which OS) you cann access the files with => http://localhost:1338

To use this framework you can just import the js. file. 
Afterwards you need to tell the programm which Components you want to have clever and on which attributes it should listen. 
Everything start with the Xvar class. 

```javascript
  Xvar.createXel('div',['color',"background-color"]);
```

This tells the class to create a webComponent named "x-div" on which you can change the content with data-link or the style with style-color f.e.. 
If you give the style-attributes an Xvar data Type you just need to change data to manipulate UI. The data and the element listens on its own changes. 
To make this happen we create a Xvar data type. 

```javascript
  var xdata = new Xvar()
```

xdata is now an Object/Array which you can change and link with the custom element attributes. 

```javascript
  xdata["divcolor"] = "blue"
  xdata["text"] = "This is a sample text!"
```

now you link the xdata["divcolor"] to the custom Element. 

```javascript
  <div is="x-div" style-color="xdata['divcolor']" data-link="xdata['text']"></div>"
```

if you just change the data like: 

```javascript
  xdata["divcolor"] = "red"
  xdata["text"] = "This is another text!"
```

The UI gets updated accordingly. 

- See example file => simpleexample.html

But what would a real framework be without templates! So we use x-template as a view controller. 
Before you can use templates you need to preload them in javascript with: 

```javascript
Xvar.loadTemplates(
    [
      {name:'blank', url:"blank.html"},
      {name:'login', url:"login.html"},
      {name:'main', url:"main.html"}
    ]
  );
```

you don't need to write html in your html files. 

Another feature is to add a template library.
The initiial load time will be longer, but the loading time after the loading time will be reduce. 

If you want work with template library reliably, you have to add propperties for the component you want to use.
which could look like this: 

```Javascript
      var buttonprops = {};
      buttonprops.text = "the button";
      buttonprops.color = "red";
      buttonprops.bgcolor = "black";
      buttonprops.clickfunction = function () {console.log("Button Click!")};
```

Adding the propperties for the fitting component, give the possibillity to design and add a funtion for the existing component.

The complete code to use templates can be seen in index.html

If you link the template to an Xvar you can change the viewcontroller just by changing the xvar data. 

```javascript
  <x-template x-name="site['view']" x-props="x['props']"></x-template>
```

You can add props which will be changed if you write props in corresponding element attributes. 
The same with x-repeat which you can use on each x-element. 

```javascript
  <tbody id="table1" is="x-tbody" x-repeat="datax">
          <tr>
              <td> <div is="x-div" style-color="props['color']" style-background-color="props['color']">Test bg Color</div></td>
              <td is="x-td" data-link="props['name']"></td>
              <td is="x-td" data-link="props['Supername']"></td>
          </tr>
  </tbody>
```

You can see a working example in the main.html file. 
Just login with any Username and the main.html file will be rendered. 

Filtering and handling data gets much more convenient, when you don't need to hassle with UI so much. 
Just change the data and load the new data in the attribute: 
```javascript
  document.getElementById("table1").setAttribute("x-repeat","tabledata");
```
and everything will be rendered accordingly. 

To build this (sorry "UGLY") table just took me 4 hours with all functions from scratch. 
Using React with learning a new library for clever tables which then doesn't have that one feature I need... You see where I'm getting at. 

You just need Proxies and WebComponents to render everything in your app yourself!

## Additional functions
  If you open 1.html you can see additional functions in action. 
  You can link different Xvar-attributes with a function like in svelte but it's in realtime => no prerender: 
  ```javascript
    var x = new Xvar();
    x[1] = 10;
    x[4] = 20;
    x[2] = '$: x[1] + x[4]';
    x[3] = "$: 2*x[2]";
    console.log(x[3]);
    x[1] = 15;
    console.log(x[3]);
    x[4] = 10;
    console.log(x[3]);
    x[2] = `
    $:()
        var a = 3;
        var b = 2;
        return a*x[1] + b*x[4];
    `;
    console.log(x[2]);
  ```
  
  If one of these functions gets attached to a x-element UI will refresh automatically if any of the data inside these functions changes. 
  Further below you can see an excel like example programmed with this technology.
  
  
