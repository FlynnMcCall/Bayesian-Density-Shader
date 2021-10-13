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
const vec4 bumpColour = vec4(0.155,0.165,0.165,1.000);
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
const float sigma = 1.316;
const float intArea = 0.280;


// ----- Visualisation controlls --------------------------
const bool smoothFunction = false;
// toggles between smooth and terraced intensity functions

const int terraces = 20;
// defines the range of powers terraced

const int minTerrace = -8;
// defines the cutoff for the minimum probability density

const float exponent = 10.0;
// defines the power used to visualise each terrace

const float expMod = 3.0;
// defines how many orders of magnitude the original exponant spans in 1 terrace
// ie. setting to 2.0 means 1 terrace spans 2 orders of magnitude in the base of variable "exponent"

const float termScaleFactor = 10000.472;
// due to the limitaions of floats, the computation of probability densities can quickly approach zero
// because of this limitation, when the probability of generating a sampled value is multiplied by the 
// previous terms, an additional constant must be included so that during the calculation, the highest
// densities never become too low to be stored as a float
// this needs to be manually tweaked on a case by case basis



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
float smoothIntensity(float sum){
   float log_sum_e = (log(sum)/log(exponent))/ expMod;
   float powerlevel = log_sum_e;
   return (powerlevel - float(minTerrace)) * (1.0/float(terraces));}
// smooth intensity plots the bump continuously

float terracedIntensity(float sum){
   float log_sum_e = (log(sum)/log(exponent))/ expMod;
   float powerlevel = log_sum_e - mod(log_sum_e, 1.0);
   return (powerlevel - float(minTerrace)) * (1.0/float(terraces));}
// terraced intensity gives definite layers





const int pointsLength = 11;

void main(){
   	vec2 points[pointsLength];
   	// This version of the shader cannot get the length of an array
   	// for this reason the length of points is a constant defined above
   	points[0] = vec2(-4.5, -0.1);
   	points[1] = vec2(5.5, -0.67);
   	points[2] = vec2(0.2, -1);
   	points[3] = vec2(-1.75, -1.03);
   	points[4] = vec2(-1.25, -1.08);
   	points[5] = vec2(5,-1.26);
   	points[6] = vec2(-1.53, -1.51);
   	points[7] = vec2(4.88, -1.64);
    points[8] = vec2(-4.63, -1.96);
    points[9] = vec2(2.33, -3.67);
    points[10] = vec2(1, -3.67);
	//points[11] = vec2(10, -6);
    
   vec2 xy = gl_FragCoord.xy/u_resolution;
   vec2 gridPos = normPostoGrid(xy);
	

   bool ispoint = false;
   float sum = 1.0;

   for(int i =0; i < pointsLength; i++){
		float d = length(vec2(gridPos - points[i]));
       float a = d - intArea;
   	float b = d + intArea;

       sum *= termScaleFactor*( erf( b / (sqrt(2.0)*sigma) ) - erf( a / (sqrt(2.0)*sigma)));

       if (d < pointThickness){ ispoint = true;}
       // evaluates if pixel is within cutoff to render as point

   }


   float intensity;
   if(smoothFunction){ intensity = smoothIntensity(sum);}
   else{intensity = terracedIntensity(sum);}
   // uses either smooth or terraced functions for intensity

   if (1.0 < intensity){intensity = 1.0;}
   if (intensity < 0.0){intensity = 0.0;}

   //Render(intensity,  ispoint,  gridPos);
   if (ispoint){ gl_FragColor = pointColour; }
   else{
       if(cm && ( length(gridPos) < cmThickness )){gl_FragColor = cmcol;}
       else{
       	if ((cAxis && (( length(gridPos.x) < cAxisThickness ) || ( length(gridPos.y) < cAxisThickness )))){gl_FragColor = cAxiscol;}
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