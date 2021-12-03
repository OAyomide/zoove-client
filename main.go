package main

import (
	"log"
	"net/http"
	"os"
)

var getenv = os.Getenv

const (
	xForwardedProtoHeader = "x-forwarded-proto"
	goEnviron             = "GO_ENV"
)

func main() {
	port := os.Getenv("PORT")

	if port == "" {
		port = "9000"
	}

	hl := http.FileServer(http.Dir("./client/build"))
	http.Handle("/", hl)
	log.Printf("SERVER UP AND RUNNING ON PORT %s", port)
	log.Fatal(http.ListenAndServe(":"+port, ForceSsl(hl)))
}

func ForceSsl(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if os.Getenv("GO_ENV") == "production" {
			if r.Header.Get(xForwardedProtoHeader) != "https" {
				sslUrl := "https://" + r.Host + r.RequestURI
				http.Redirect(w, r, sslUrl, http.StatusTemporaryRedirect)
				return
			}
		}

		next.ServeHTTP(w, r)
	})
}
