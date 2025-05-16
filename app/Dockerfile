# https://docs.docker.com/guides/golang/build-images/
FROM golang:1.23

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY *.go ./

RUN CGO_BUILD_ENABLED=0 go build -o /simple-api

EXPOSE 8080

CMD ["/simple-api"]

