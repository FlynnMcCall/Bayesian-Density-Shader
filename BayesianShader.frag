#version 100 
#ifdef GL_ES
precision mediump float;
#endif
#define PI 3.14159265359
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;


// FIELDS
//
// ----- Grid Size ----------------------------------------
const float gridsize = 12.5;
// this is the largest x and y value on the grid

// ----- Graphics -----------------------------------------
const vec4 planeColour = vec4(1.0,1.0,1.0,1.000);
const vec4 bumpColour = vec4(0.343,0.548,0.740,1.000);
// sets the background and bump colours respectively

const bool drawGrid = true;
const vec4 gridColour = vec4(0.376,0.741,0.770,1.000);
const float gridThickness = 0.042;
// controls thickness and colour of gridlines

const bool cAxis = true;
const float cAxisThickness = 0.042;
const vec4 cAxiscol = vec4(1.000,0.132,0.344,1.000);
// toggles central axis and related parameters

const vec4 pointColour = vec4(0.895,0.232,0.266,1.000);
const float pointThickness = 0.156;
// guess what this does

const bool cm = false;
const float cmThickness = 0.248;
const vec4 cmcol = vec4(0.050,0.009,0.016,1.000);
// toggles point on centre and parameters

// note that thickness is proportional to the size of the unit circle


// ----- Gausian controlls --------------------------------
const float sigma = 1.564;
const float intArea = 0.280;


// ----- Visualisation controlls --------------------------
const bool smoothFunction = false;
// toggles between smooth and terraced intensity functions

const int terraces = 10;
// defines the range of powers terraced

const int minTerrace = 1;
// defines the cutoff minimum power for white

const float exponent = 9.184;
// defines the power used



// METHODS
//
// ----- Logical  -----------------------------------------
vec2 normPostoGrid(vec2 normPos){
   return 2.0 * gridsize*(normPos - vec2(0.5, 0.5));}
// converts normalised position vectors to the grid

// ----- Mathematical  ------------------------------------
float erf(float x){
   float a1 = 0.278393;
   float a2 = 0.230389;
   float a3 = 0.000972;
   float a4 = 0.078108;

   float denominator = pow((1.0 + x*a1 + a2 *pow(x, 2.0) + a3*pow(x, 3.0) + a4*pow(x, 4.0)),4.0);
   return (1.0 - (1.0/denominator));}
// erf is the error function
// The approximation used has a maximum error of 5 * 10^-4 for x < 0


// ----- Intensity Functions  -----------------------------
float smoothIntensity(float exponent, float sum, int minPower, int powerRange){
   float log_sum_e = log(sum)/log(exponent);
   float powerlevel = log_sum_e;
   return (powerlevel - float(minPower)) * (1.0/float(powerRange));}
// smooth intensity plots the bump continuously

float terracedIntensity(float exponent, float sum, int minPower, int powerRange){
   float log_sum_e = log(sum)/log(exponent);
   float powerlevel = log_sum_e - mod(log_sum_e, 1.0);
   return (powerlevel - float(minPower)) * (1.0/float(powerRange));}
// terraced intensity gives definite layers


/*
void Render(float intensity, bool ispoint, vec2 gridPos){
   // render order (lowest to highest):
   // heatmap
   // grid
   // central axis
   // points

   if (ispoint){ gl_FragColor = pointColour; }
   else{
       if(cm && ( length(gridPos) < cmThickness )){gl_FragColor = cmcol;}
       else{
       	if (cAxis && ( length(gridPos.x) < cAxisThickness ) || ( length(gridPos.y) < cAxisThickness )){gl_FragColor = cAxiscol;}
       	else{
       		float disXp = abs(mod((gridPos.x) , 1.0));
       		float disXn = abs(mod((-gridPos.x) , 1.0));
   			float disYp = abs(mod((gridPos.y) , 1.0));
       		float disYn =abs(mod((-gridPos.y) , 1.0));

				if( ( disXp < gridThickness || disXn < gridThickness) || (disYp < gridThickness || disYn < gridThickness)){gl_FragColor = gridColour;}
       		else{gl_FragColor = vec4(1.000- intensity, 1.000- intensity, 1.000- intensity, 1);}
           }
       }
   }
}
*/







const int pointsLength = 8;

void main(){
   vec2 points[pointsLength];
   // This version of the shader cannot get the length of an array
   // for this reason the length of points is a constant defined above
   points[0] = vec2(2, -1);
   points[1] = vec2(1, 1);
   points[2] = vec2(4.5, 2.5);
   points[3] = vec2(0, -1);
   points[4] = vec2(5, -1);
   points[5] = vec2(1.5,3);
   points[6] = vec2(2, -6);
   points[7] = normPostoGrid(u_mouse/u_resolution);
   //points[7] = vec2(2.5, -3.5);

   vec2 xy = gl_FragCoord.xy/u_resolution;
   vec2 gridPos = normPostoGrid(xy);
	

   bool ispoint = false;
   float sum = 1.0;

   for(int i =0; i < pointsLength; i++){
		float d = length(vec2(gridPos - points[i]));
       float a = d - intArea;
   	float b = d + intArea;

       sum *= 1000.0*( erf( b / (sqrt(2.0)*sigma) ) - erf( a / (sqrt(2.0)*sigma)));

       if (d < pointThickness){ ispoint = true;}
       // evaluates if pixel is within cutoff to render as point

   }




   float intensity;
   if(smoothFunction){ intensity = smoothIntensity(exponent, sum, minTerrace, terraces);}
   else{intensity = terracedIntensity(exponent, sum, minTerrace, terraces);}
   // uses either smooth or terraced functions for intensity

   if (1.0 < intensity){intensity = 1.0;}
   if (intensity < 0.0){intensity = 0.0;}

   //Render(intensity,  ispoint,  gridPos);
   if (ispoint){ gl_FragColor = pointColour; }
   else{
       if(cm && ( length(gridPos) < cmThickness )){gl_FragColor = cmcol;}
       else{
       	if ((cAxis && ( length(gridPos.x) < cAxisThickness ) || ( length(gridPos.y) < cAxisThickness ))){gl_FragColor = cAxiscol;}
       	else{
       		float disXp = abs(mod((gridPos.x) , 1.0));
       		float disXn = abs(mod((-gridPos.x) , 1.0));
   			float disYp = abs(mod((gridPos.y) , 1.0));
       		float disYn =abs(mod((-gridPos.y) , 1.0));
				if( drawGrid && (( disXp < gridThickness || disXn < gridThickness) || (disYp < gridThickness || disYn < gridThickness))){gl_FragColor = gridColour;}
       		else{
                   vec4 colour = vec4(0.823,0.845,0.652,1.000);
                   colour.x = intensity*(bumpColour.x - planeColour.x) + planeColour.x;
                   colour.y = intensity*(bumpColour.y - planeColour.y) + planeColour.y;
                   colour.z = intensity*(bumpColour.z - planeColour.z) + planeColour.z;
                   gl_FragColor = colour;
               }
           }
       }
   }
}