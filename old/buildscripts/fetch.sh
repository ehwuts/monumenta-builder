#!/bin/bash
# chiinox public sheet url
# https://docs.google.com/spreadsheets/d/1Kd4gBfjR4FR6T28lpbcKONlaekldiQ8t67oPPVR7PD0/edit?usp=sharing

# line that worked for comp sheet
# curl -L  "https://docs.google.com/spreadsheets/d/1Md10PXJQ-Sb_frXnEQQU8Mvab73cABS3ba3YmMLFVK4/export?format=csv&id=1Md10PXJQ-Sb_frXnEQQU8Mvab73cABS3ba3YmMLFVK4&gid=0" -o "raw/sheet0.csv"

#test 1
# line that worked for chiinox sheet
# curl -L  "https://docs.google.com/spreadsheets/d/1Kd4gBfjR4FR6T28lpbcKONlaekldiQ8t67oPPVR7PD0/export?format=csv&gid=1883047759" -o "./data/raw/Chiinox_ - Item Backend Data.csv"

#curl -L "https://raw.githubusercontent.com/albarv340/ohthemisery/main/public/items/itemData.json" -o "./data/raw/ohthemisery - itemData.json"
#curl -L "https://raw.githubusercontent.com/albarv340/ohthemisery/main/public/items/vanityData.json" -o "./data/raw/ohthemisery - vanityData.json"
#curl -L "https://raw.githubusercontent.com/albarv340/ohthemisery/main/public/items/enchantmentsData.json" -o "./data/raw/ohthemisery - enchantmentsData.json"

curl -L "https://api.playmonumenta.com/items" -o "./data/raw/MonumentaAPI - Items.json"
curl -L "https://api.playmonumenta.com/advancements" -o "./data/raw/MonumentaAPI - Advancements.json"