package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"rov-system/backend/internal/config"
	"rov-system/backend/internal/control"
	"rov-system/backend/internal/sim"
	"rov-system/backend/internal/ws"
)

func main() {
	addr := os.Getenv("ADDR")
	if addr == "" {
		addr = ":8080"
	}

	mockMode := config.IsMockMode()
	if mockMode {
		log.Println("mode: mock (internal physics simulator enabled)")
	} else {
		log.Println("mode: real (hardware expected, mock physics disabled)")
	}

	ctrl := control.NewState()
	simulator := sim.New(mockMode)
	wsServer := ws.NewServer(ctrl, simulator)
	go wsServer.Run()

	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})
	mux.HandleFunc("GET /ws", wsServer.HandleWS)
	mux.HandleFunc("GET /sim/state", simulator.ServeState)

	server := &http.Server{
		Addr:    addr,
		Handler: mux,
	}

	go func() {
		log.Printf("server listening on %s", addr)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("shutdown: %v", err)
	}
	fmt.Println("server stopped")
}
