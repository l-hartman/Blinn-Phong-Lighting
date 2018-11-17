#include <iostream>
#include <sstream>
#include <fstream>
#include <vector>
#include <string>
#include <tuple>
#include <cctype>

using namespace std;

struct Vec3 {
    double x;
    double y;
    double z;
};

vector<Vec3> positions;
vector<Vec3> normals;

const double SCALE = 0.3;

void eatWhitespace(istream &in);

void print(string var, Vec3 data, double scale = 1);

int main(int argc, char* argv[]) {
    if (argc != 3) {
        cerr << "Usage: " << argv[0] << " infile prefix" << endl;
        cerr << "Where infile is the name of an obj file to load" << endl;
        cerr << "And prefix is the prefix to use for the javascript variables" << endl;
        cerr << "Output is sent to stdout." << endl;
        return 1;
    }
    ifstream in(argv[1]);
    if (!in) {
        cerr << "Error loading " << argv[1] << endl;
        return 1;
    }
    string prefix = argv[2];
    cout << prefix << "_pos = [];" << endl;
    cout << prefix << "_norm = [];" << endl;
    int linum = 0;
    string line;
    while (getline(in, line)) {
        linum++;
        istringstream iss(line);
        string token;
        iss >> token;
        if (!iss) {
            // blank line
            continue;
        }
        if (token[0] == '#') {
            // comment
            continue;
        } else if (token == "v") {
            // position
            Vec3 pos;
            iss >> pos.x >> pos.y >> pos.z;
            positions.push_back(pos);
        } else if (token == "o") {
            // object indication; ignore
            continue;
        } else if (token == "s") {
            // smoothing group; ignore
            continue;
        } else if (token == "vn") {
            // normal
            Vec3 norm;
            iss >> norm.x >> norm.y >> norm.z;
            normals.push_back(norm);
        } else if (token == "vf") {
            // texture coord (ignored, for now)
            continue;
        } else if (token == "f") {
            // face
            vector<int> posIdx;
            vector<int> normIdx;
            int tmp;
            eatWhitespace(iss);
            while (iss) {
                char next = iss.peek();
                if (!isdigit(next)) {
                    cerr << "Expected digit at " << linum << endl;
                    cerr << line;
                    return 1;
                }
                iss >> tmp;
                posIdx.push_back(tmp);
                if (iss.peek() != '/') {
                    cerr << "Expected generated normals at " << linum << endl;
                    cerr << line;
                    return 1;
                }
                iss.get();
                eatWhitespace(iss);
                next = iss.peek();
                if (isdigit(next)) {
                    int dummy;
                    iss >> dummy;
                    eatWhitespace(iss);
                }
                if (iss.peek() != '/') {
                    cerr << "Expected '/' at " << linum << endl;
                    cerr << line;
                    return 1;
                }
                iss.get();
                iss >> tmp;
                normIdx.push_back(tmp);
                eatWhitespace(iss);
            }
            if (posIdx.size() != normIdx.size()) {
                cerr << "Expected matching counts at " << linum << endl;
                cerr << line;
                return 1;
            }
            for (int i=2; i<posIdx.size(); i++) {
                print(prefix+"_pos", positions[posIdx[0]-1], SCALE);
                print(prefix+"_pos", positions[posIdx[i-1]-1], SCALE);
                print(prefix+"_pos", positions[posIdx[i]-1], SCALE);

                print(prefix+"_norm", normals[normIdx[0]-1]);
                print(prefix+"_norm", normals[normIdx[i-1]-1]);
                print(prefix+"_norm", normals[normIdx[i]-1]);
            }

        } else {
            cerr << "Unrecognized token: " << token << " at " << linum << endl;
            cerr << line;
            return 1;
        }
    }
}

void eatWhitespace(istream &in) {
    char c;
    c = in.peek();
    while (c == ' ' || c == '\t' || c == '\n') {
        if (!in) return;
        in.get();
        c = in.peek();
    }
}

void print(string var, Vec3 data, double scale) {
    cout << var << ".push(vec3(";
    cout << data.x * scale << ",";
    cout << data.y * scale << ",";
    cout << data.z * scale << "));" << endl;
}