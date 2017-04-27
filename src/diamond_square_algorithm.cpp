#include <iostream>
#include <vector>
#include <cmath>
#include <algorithm>
#include <cstdlib>
#include <string>

#define MAX_HEIGHT_DEFAULT 128
#define N_DEFAULT 1025

using namespace std;

void diamond(int _square, int & N, vector< vector< int > > & terrain, int d){

	int square = _square / 2;
	if(square == 0) return;

	//	Diamond step
	for(int i = square; i < N - 1; i += square ){
		for(int j = square; j < N - 1; j += square ){
			if(terrain[i][j] == 0){
				terrain[i][j] = (terrain[i-square][j-square] + 
								 terrain[i+square][j-square] +
								 terrain[i-square][j+square] +
								 terrain[i+square][j+square]) / 4;
				terrain[i][j] += (rand() % (d*2)) - d;
			}
		}
	}

	//	Square step
	int offset = 0;
	for(int i = 0; i < N; i += square){
		offset = (offset == 0) ? square : 0;
		for(int j = offset; j < N; j += _square){
			int top = (i != 0) ? terrain[i-square][j] : 0;
			int bottom = (i != N-1) ? terrain[i+square][j] : 0;
			int left = (j != 0) ? terrain[i][j-square] : 0;
			int right = (j != N-1) ? terrain[i][j+square] : 0;

			terrain[i][j] = (top==0||bottom==0||left==N-1||right==N-1) ? (top + left + bottom + right) / 3 : (top + left + bottom + right) / 4;
			terrain[i][j] += (rand() % (d*2)) - d;
		}
	}
	if(d <= 1) 
		diamond(square, N, terrain, d);
	else
		diamond(square, N, terrain, d*.5);
}

void printColorEarth(int height, int maxHeight){
	unsigned char r, g, b;
	int pieceSz = (maxHeight*2) / 9;
	if(height < pieceSz-maxHeight) {
		r = 0; g = 0; b = 153; // deep ocean
	}
	else if (height < (2*pieceSz)-maxHeight) {
		r = 0; g = 77; b = 204; // mid ocean
	}
	else if (height < (3*pieceSz)-maxHeight) {
		r = 0; g = 153; b = 255; // shallow ocean
	}
	else if (height < (4*pieceSz)-maxHeight) {
		r = 248; g = 248; b = 153; // sand
	}
	else if (height < (5*pieceSz)-maxHeight) {
		r = 45; g = 191; b = 35; // light vegetation
	}
	else if (height < (6*pieceSz)-maxHeight) {
		r = 6; g = 115; b = 5; // dense vegetation
	}
	else if (height < (7*pieceSz)-maxHeight) {
		r = 175; g = 175; b = 175; // rocky
	}
	else if (height < (8*pieceSz)-maxHeight) {
		r = 111; g = 111; b = 111; // mountain
	}
	else {
		r = 248; g = 248; b = 248; // mountain top
	}

	std::cout << (int)r << " " << (int)g << " " << (int)b << std::endl;
}

void printColorSky(int height, int maxHeight){
	unsigned char r, g, b;
	int pieceSz = (maxHeight*2) / 8;
	if(height < pieceSz-maxHeight) {
		r = 255; g = 255; b = 255; // deep ocean
	}
	else if (height < (2*pieceSz)-maxHeight) {
		r = 234; g = 234; b = 255; // mid ocean
	}
	else if (height < (3*pieceSz)-maxHeight) {
		r = 212; g = 212; b = 255; // shallow ocean
	}
	else if (height < (4*pieceSz)-maxHeight) {
		r = 191; g = 191; b = 255; // sand
	}
	else if (height < (5*pieceSz)-maxHeight) {
		r = 64; g = 64; b = 255;; // mountain
	}
	else if (height < (6*pieceSz)-maxHeight) {
		r = 43; g = 43; b = 255; // mountain
	}
	else if (height < (7*pieceSz)-maxHeight) {
		r = 21; g = 21; b = 255; // mountain
	}
	else {
		r = 255; g = 255; b = 255; // mountain top
	}

	std::cout << (int)r << " " << (int)g << " " << (int)b << std::endl;
}

int main(int argn, char ** argv){
	

	/* initialize random seed: */
  	srand (time(NULL));
	
	// Creating matrix
  	int N = N_DEFAULT;
  	if(argn > 1)
  		N = pow(2, stoi(argv[1])) + 1;

	vector< vector< int > > terrain(N);

	vector<int> stub(N);
	fill(stub.begin(), stub.end(),0);

	for(int i = 0 ; i < N; ++i){
		terrain[i] = stub;
	}

	int MAX_HEIGHT = MAX_HEIGHT_DEFAULT;
	if(argn > 2)
		MAX_HEIGHT = stoi(argv[2]);

	terrain[0][0] = (rand() % (MAX_HEIGHT*2)) - MAX_HEIGHT;
	terrain[0][N-1] = (rand() % (MAX_HEIGHT*2)) - MAX_HEIGHT;
	terrain[N-1][0] = (rand() % (MAX_HEIGHT*2)) - MAX_HEIGHT;
	terrain[N-1][N-1] = (rand() % (MAX_HEIGHT*2)) - MAX_HEIGHT;

	diamond(N,N,terrain,MAX_HEIGHT*.75);

	cout << "P3\n" << N << " " << N << "\n" << 255 << endl;

	for(int i = 0; i < N; ++i)
	for(int j = 0; j < N; ++j)	printColorSky(terrain[i][j], MAX_HEIGHT);		

	return 0;
}