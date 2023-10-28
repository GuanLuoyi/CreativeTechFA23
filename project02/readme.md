# Synthetic Relationships

Communication lies at the core of all media. From speech to the written word, from radio to social networks - the core function of media has been to enable and facilitate communication. In this project we're going to take on this radical approach to communication, and try to get to the root of mediated exchange. We will examine how data is collected, how it is transformed into information, how it can be encoded, transmitted, and decoded. In the process we will encounter the need to build contextualized systems of meaning: systems of representation that maintain internal coherence, but might not make a lot of sense when seen from the outside.

My partner Yuanlin and I construct two electronic beings capable of perceiving some aspects of the environment around them. Then we connect them into a network that would enable them to communicate their findings, and respond to the communications of their counterpart.

## Sensors/Input
### Yuanlin: Flex Sensor
A turbulance-control glove, Bend the finger to generate turbulance in specific position  

<img width="600" alt="Screenshot 2023-10-27 at 8 36 47 PM" src="https://github.com/GuanLuoyi/CreativeTechFA23/assets/95225808/98f8645d-a2ff-45a3-8e8b-a68f3818ca30">

### Luoyi: Adafruit APDS9960 Proximity, Light, RGB and Gesture Sensor
A sensor to receive RGB value in order to change the material color of the monitor in digital world
  
<img width="600" alt="Screenshot 2023-10-27 at 8 38 51 PM" src="https://github.com/GuanLuoyi/CreativeTechFA23/assets/95225808/2999941f-6176-4754-b769-b608ad51ef7d">

## Input Code
### Set Up
```C
#include "Adafruit_APDS9960.h"
Adafruit_APDS9960 apds;

#include "config.h"
AdafruitIO_Feed *r_feed = io.feed("r_feed");
AdafruitIO_Feed *g_feed = io.feed("g_feed");
AdafruitIO_Feed *b_feed = io.feed("b_feed");
AdafruitIO_Feed *flex1 = io.feed("10-19", "yuanlinxue");
AdafruitIO_Feed *flex2 = io.feed("10-20", "yuanlinxue");

float flex1Val = 0;
void setup() {
  Serial.begin(115200);

  if(!apds.begin()){
    Serial.println("failed to initialize device! Please check your wiring.");
  }
  else Serial.println("Device initialized!");

  //enable color sensign mode
  apds.enableColor(true);

  while(! Serial);
  
  Serial.print("Connecting to Adafruit IO");
  io.connect();

  // wait for a connection
  while(io.status() < AIO_CONNECTED) {
    Serial.print(".");
    delay(500);
  }

  // connected
  Serial.println();
  Serial.println(io.statusText());

  flex1->onMessage(handleMessage);
  // flex2->onMessage(handle2Message);
}
```

### Loop and Upload Data to Adafruit IO
```C
void loop() {
  io.run();
  //create some variables to store the color data in
  uint16_t r, g, b, c;
  

  Serial.println(flex1Val);
  //wait for color data to be ready
  while(!apds.colorDataReady()){
    delay(5);
  }

  //get the data and print the different channels
  apds.getColorData(&r, &g, &b, &c);
  r_feed->save(r);
  delay(3000);
}

void handleMessage(AdafruitIO_Data *data){
  flex1Val = data->toFloat();
}
```

## Output Code
### Main
```Java
import processing.serial.*;
Serial mySerial;
ArrayList<Particle> pts;
boolean onPressed, showInstruction = true;
boolean serialIn = false;
PFont f;
String myString = null;
String incomingValue = null;
float val;
float posX = 0;

void setup() {
  fullScreen();
  //size(1560,720);
  smooth();
  colorMode(RGB);
  rectMode(CENTER);

  pts = new ArrayList<Particle>();

  f = createFont("Serif", 24, true);
  background(255);
  printArray(Serial.list());
  String myPort = Serial.list()[1];
  mySerial = new Serial(this, myPort, 115200);
}

void draw() {
  if (showInstruction) drawInstruction();
  if (onPressed) {
    for (int i=0;i<10;i++) {
      float posY = random(height);
      Particle newP = new Particle(mouseX, posY, i+pts.size(), i+pts.size());
      pts.add(newP);
    }
  }
  
  if(serialIn) {
    for (int i=0;i<10;i++) {
      float posY = random(height);
      Particle newP = new Particle(posX, posY, i+pts.size(), i+pts.size());
      pts.add(newP);
    }
  }

  for (int i=pts.size()-1; i>-1; i--) {
    Particle p = pts.get(i);
    if (p.dead) {
      pts.remove(i);
    }else{
      p.update();
       p.display();
    }
  }
}

void drawInstruction(){
  background(255);
  fill(128);
  textAlign(CENTER, CENTER);
  textFont(f);
  textLeading(36);
  text("Bend your finger" + "\n" +
       "to grow organic shapes" + "\n"
       ,width*0.5, height*0.5);
}
```

### Particles
```Java
class Particle{
  PVector loc, vel, acc;
  int lifeSpan, passedLife;
  boolean dead;
  float alpha, weight, weightRange, decay, xOfst, yOfst;
  color c;
  
  Particle(float x, float y, float xOfst, float yOfst){
    loc = new PVector(x, y);
    
    float randDegrees = random(360);
    vel = new PVector(cos(radians(randDegrees)), sin(radians(randDegrees)));
    vel.mult(random(5));
    
    acc = new PVector(0,0);
    lifeSpan = int(random(30, 90));
    decay = random(0.75, 0.9);
    c = color(random(255),random(255),255);
    weightRange = random(3,50);
    
    this.xOfst = xOfst;
    this.yOfst = yOfst;
  }
  
  void update(){
    if(passedLife>=lifeSpan){
      dead = true;
    }else{
      passedLife++;
    }
    
    alpha = float(lifeSpan-passedLife)/lifeSpan * 70+50;
    weight = float(lifeSpan-passedLife)/lifeSpan * weightRange;
    
    acc.set(0,0);
    
    float rn = (noise((loc.x+frameCount+xOfst)*.01, (loc.y+frameCount+yOfst)*.01)-.5)*TWO_PI*4;
    float mag = noise((loc.y-frameCount)*.01, (loc.x-frameCount)*.01);
    PVector dir = new PVector(cos(rn),sin(rn));
    acc.add(dir);
    acc.mult(mag);
    
    float randRn = random(TWO_PI);
    PVector randV = new PVector(cos(randRn), sin(randRn));
    randV.mult(.25);
    acc.add(randV);
    
    vel.add(acc);
    vel.mult(decay);
    vel.limit(3);
    loc.add(vel);
  }
  
  void display(){
    strokeWeight(weight+1.5);
    //stroke(0, alpha);
    point(loc.x, loc.y);
    
    strokeWeight(weight);
    stroke(c);
    point(loc.x, loc.y);
  }
}
```

### IO - Receive data from serial and map the data to turbulance position / Receive mouse press as input as well
```Java
void mousePressed() {
  onPressed = true;
  if (showInstruction) {
    background(0);
    showInstruction = false;
  }
}

void mouseReleased() {
  onPressed = false;
}

void keyPressed() {
  if (key == 'c') {
    for (int i=pts.size()-1; i>-1; i--) {
      Particle p = pts.get(i);
      pts.remove(i);
    }
    background(255);
  }
}

void serialEvent(Serial mySerial){
  incomingValue = mySerial.readStringUntil('\n');
  println("value: " + incomingValue);
  if(incomingValue != null && int(incomingValue) != 0){
    posX = map(float(incomingValue), 0, 4095, 0, width);
    serialIn = true;
    if (showInstruction) {
      background(0);
      showInstruction = false;
    }
  }
}
```
## Outcome
<img width="1512" alt="Screenshot 2023-10-27 at 8 57 17 PM" src="https://github.com/GuanLuoyi/CreativeTechFA23/assets/95225808/3388742e-b5ff-48fe-8f45-23403966156b">

### [Click to watch the video](https://youtu.be/1LQpFV82OjQ)
