#include "Precision.h"



#include "Display.h"
#include "DisplayTubes.h"
#ifdef DIMENSION
#include "DisplayImagePCA.h"
#endif
#include "DisplayRange.h"
#include "DisplayCurves.h"
#include "DisplayMolecule.h"

#include "HDVizData.h"



#include <tclap/CmdLine.h>




#include <iostream>
#include <iomanip>
#include <math.h>
#include <unistd.h>
#include <stdlib.h>

#define MAKE_STRING_(x) #x
#define MAKE_STRING(x) MAKE_STRING_(x)

Display *mainD, *auxD, *auxD2, *auxD3;




void display1(void){
  mainD->display();
};

void mouse1(int button, int state, int x, int y){
  mainD->mouse(button, state, x, y);
}

void motion1(int x, int y){
  mainD->motion(x, y);
}

void keyboard1(unsigned char key, int x, int y){
  mainD->keyboard(key, x, y);
}

void reshape1(int w, int h){
  mainD->reshape(w, h);
}





void display2(void){
  auxD->display();
};

void mouse2(int button, int state, int x, int y){
  auxD->mouse(button, state, x, y);
}

void motion2(int x, int y){
  auxD->motion(x, y);
}

void keyboard2(unsigned char key, int x, int y){
  auxD->keyboard(key, x, y);
}

void reshape2(int w, int h){
  auxD->reshape(w, h);
}


void display3(void){
  auxD2->display();
};

void mouse3(int button, int state, int x, int y){
  auxD2->mouse(button, state, x, y);
}

void motion3(int x, int y){
  auxD2->motion(x, y);
}

void keyboard3(unsigned char key, int x, int y){
  auxD2->keyboard(key, x, y);
}

void reshape3(int w, int h){
  auxD2->reshape(w, h);
}




void display4(void){
  auxD3->display();
};

void mouse4(int button, int state, int x, int y){
  auxD3->mouse(button, state, x, y);
}

void motion4(int x, int y){
  auxD3->motion(x, y);
}

void keyboard4(unsigned char key, int x, int y){
  auxD3->keyboard(key, x, y);
}

void reshape4(int w, int h){
  auxD3->reshape(w, h);
}





void printHelp(){
	std::cout << mainD->title() << " Window" << std::endl << std::endl;
  mainD->printHelp();	
  std::cout <<  std::endl << std::endl;

//  std::cout << auxD->title() << " Window" << std::endl << std::endl;
//  auxD->printHelp();

}


int main(int argc, char **argv){	
  //Command line parsing
  TCLAP::CmdLine cmd("HDViz", ' ', "1");

  TCLAP::SwitchArg boxArg("b", "b", 
      "Display domain with boxplots", false);
  cmd.add(boxArg);
 
  TCLAP::SwitchArg curvesArg("c", "curves", 
      "Display inverse regression curves", false);
  cmd.add(curvesArg);
  
  TCLAP::SwitchArg molArg("m", "molecule", 
      "Display domain as molecule", false);
  cmd.add(molArg);
     
  TCLAP::ValueArg<std::string>  fontArg("f", "font", 
      "Absolute path of a ttf font", false, "", "");
  cmd.add(fontArg);
  
  try{
	  cmd.parse( argc, argv );
	} 
  catch (TCLAP::ArgException &e){ 
    std::cerr << "error: " << e.error() << " for arg " << e.argId() << std::endl; 
    return -1;
  }


  
  //GL stuff
  glutInit(&argc, argv);
  glutInitDisplayMode(GLUT_RGBA|GLUT_ALPHA|GLUT_DOUBLE|GLUT_DEPTH|GLUT_STENCIL);



  //Load data
try{ 
 HDVizData data;



  std::string fontname = fontArg.getValue();
  if(fontname.size() == 0){
    fontname= MAKE_STRING(FONTNAME);
  }

  //Windows
  mainD = new DisplayTubes<Precision>(&data, fontname);

#ifdef DIMENSION

  // std::cout << "DIMENSION defined as \"" << DIMENSION << "\"" << std::endl;
  auxD = new DisplayImagePCA<Image, Precision>(&data, fontname);
  if( !auxD->loadAdditionalData() ) return 1;

#else
 
  // std::cout << "DIMENSION not defined." << std::endl;
 
  if(boxArg.getValue()){
    auxD = new DisplayRange<Precision>(&data, fontname);
  }
  else{
    auxD = NULL;
  }

 
  if(curvesArg.getValue()){
    auxD2 = new DisplayCurves<Precision>(&data, fontname);
    if(!auxD2->loadAdditionalData()){
      auxD2 = NULL;
    }
  }
  else{
    auxD2 = NULL;
  }

 
  if(molArg.getValue()){
    auxD3 = new DisplayMolecule<Precision>(&data, fontname);
    if(!auxD3->loadAdditionalData()){
      auxD3 = NULL;
    }
  }
  else{
    auxD3 = NULL;
  }
#endif 


  
  glutInitWindowSize(1000, 1000); 
  int mainWindow = glutCreateWindow(mainD->title().c_str());
  glutDisplayFunc(display1);
  glutReshapeFunc(reshape1);
  glutMouseFunc(mouse1);
	glutMotionFunc(motion1);
  glutKeyboardFunc(keyboard1);
  mainD->init();
  data.addWindow(mainWindow);



 
  if(auxD != NULL){ 
    glutInitWindowSize(500, 500); 
    int auxWindow = glutCreateWindow(auxD->title().c_str());
    glutDisplayFunc(display2);
    glutReshapeFunc(reshape2);
    glutMouseFunc(mouse2);
    glutMotionFunc(motion2);
    glutKeyboardFunc(keyboard2);
    auxD->init();

    data.addWindow(auxWindow);
  }

  if(auxD2 != NULL){
    glutInitWindowSize(500, 500); 
    int auxWindow2 = glutCreateWindow(auxD2->title().c_str());
    glutDisplayFunc(display3);
    glutReshapeFunc(reshape3);
    glutMouseFunc(mouse3);
    glutMotionFunc(motion3);
    glutKeyboardFunc(keyboard3);
    auxD2->init();
    data.addWindow(auxWindow2);
  }


  if(auxD3 != NULL){
    glutInitWindowSize(500, 500); 
    int auxWindow3 = glutCreateWindow(auxD3->title().c_str());
    glutDisplayFunc(display4);
    glutReshapeFunc(reshape4);
    glutMouseFunc(mouse4);
    glutMotionFunc(motion4);
    glutKeyboardFunc(keyboard4);
    auxD3->init();
    data.addWindow(auxWindow3);
  }

  printHelp();


  glutMainLoop();

}
catch (std::bad_alloc& ba)
  {
    std::cout << ba.what() << std::endl;
}

  return 0;
}