#!/bin/bash
# chiinox public sheet url
# https://docs.google.com/spreadsheets/d/1Kd4gBfjR4FR6T28lpbcKONlaekldiQ8t67oPPVR7PD0/edit?usp=sharing

# line that worked for comp sheet
# curl -L  "https://docs.google.com/spreadsheets/d/1Md10PXJQ-Sb_frXnEQQU8Mvab73cABS3ba3YmMLFVK4/export?format=csv&id=1Md10PXJQ-Sb_frXnEQQU8Mvab73cABS3ba3YmMLFVK4&gid=0" -o "raw/sheet0.csv"

#test 1
curl -L  "https://docs.google.com/spreadsheets/d/1Kd4gBfjR4FR6T28lpbcKONlaekldiQ8t67oPPVR7PD0/export?format=csv&gid=1883047759" -o "./data/raw/Chiinox_ - Item Backend Data.csv"