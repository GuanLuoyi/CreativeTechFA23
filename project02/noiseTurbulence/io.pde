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
