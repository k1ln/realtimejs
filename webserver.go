package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
)

func main() {
	port := "1338"
	mydir, err := os.Getwd()
	if err != nil {
		fmt.Println(err)
	}
	directory := mydir

	http.Handle("/", http.FileServer(http.Dir(directory)))

	log.Printf("Serving %s on HTTP port: %s\n", directory, port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
