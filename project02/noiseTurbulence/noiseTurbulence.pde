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
