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
  // g_feed->save(g);
  // b_feed->save(b);


  // Serial.print("red: ");
  // Serial.print(r);
  
  // Serial.print(" green: ");
  // Serial.print(g);
  
  // Serial.print(" blue: ");
  // Serial.print(b);
  
  // Serial.print(" clear: ");
  // Serial.println(c);
  // Serial.println();
  
  delay(3000);
}

void handleMessage(AdafruitIO_Data *data){
  // Serial.println(data->value());

  flex1Val = data->toFloat();
}