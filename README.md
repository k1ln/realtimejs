# realtimejs
Realtime.js is a fast frontend framework based on Web-Components. It has a lot of features to simplify your way of live as a vanillajs developer. The framework is programmed in szch a way, that you can edit it yourself if you need additional features.

Depending on which clever Web-Components you need the framework renders these components from the Start. 

The framework introduces two different technologies. 
- These are proxies => Xvar 
- Web Components => f.e. x-div

If you combine these two technologies you don't  need to care about refreshing UI anymore if everything has been set. 
All you need to do is change Data and the GUI manipulating will occure itself, without any additional react render overhead you cannot debug. 

To use this framework you can just import the js. file. 
Afterwards you need to tell the programm which Components you want to have clever and on which attributes it should listen. 
Everything start with the Xvar class. 

```
  Xvar.createXel('div',['color',"background-color"]);
```
