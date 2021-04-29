require( "dotenv" ).config();

const authMiddleware = require( "./src/middleware" );

const skIo      = require( "socket.io" )
const express   = require( "express" );
const http      = require( "http" );
const { isEmpty } = require( "lodash" );

const app       = express();
const server    = http.Server( app );

const port      = process.env.PORT || 4000;

const io = skIo( server, {
    cors: {
        origin: true
    }
} );

let [ statusIn, statusOut ] = Array( 5 ).fill( "" );
let [ queueIn, queueOut ] = Array( 5 ).fill( {} );
let logIn   = [];
let logOut  = [];

socket.use( authMiddleware );

io.on( "connection", ( socket ) =>{

    socket.on( "get updated status in", ( callbackFn )  => callbackFn( statusIn ) );
    socket.on( "get updated status out", ( callbackFn ) => callbackFn( statusOut ) );

    socket.on( "get updated queue in", ( callbackFn )   => callbackFn( isEmpty( queueIn )   ? [] : [ queueIn ] ) );
    socket.on( "get updated queue out", ( callbackFn )  => callbackFn( isEmpty( queueOut )  ? [] : [ queueOut ] ) );

    socket.on( "get updated log in", ( callbackFn )     => callbackFn( logIn ) );
    socket.on( "get updated log out", ( callbackFn )    => callbackFn( logOut ) );

    socket.on( "update status in", ( r, callbackFn )    => callbackFn( socket.broadcast.emit( "updated status in", statusIn = r ) ) );
    socket.on( "update status out", ( r, callbackFn )   => callbackFn( socket.broadcast.emit( "updated status out", statusOut= r ) ) );

    socket.on( "update queue in", ( r, callbackFn ) =>{

        let cb = true;

        if( r?.cod_frota !== queueIn?.cod_frota || isEmpty( r ) ){

            queueIn = Object.assign( {}, r );
            cb      = socket.broadcast.emit( "updated queue in", isEmpty( queueIn ) ? [] : [ queueIn ] );

        }
        
        callbackFn( cb );

    } );

    socket.on( "update queue out", ( r, callbackFn ) =>{

        let cb = true;

        if( r?.cod_frota !== queueOut?.cod_frota || isEmpty( r ) ){

            queueOut= Object.assign( {}, r );
            cb      = socket.broadcast.emit( "updated queue out", isEmpty( queueOut ) ? [] : [ queueOut ] );

        }
        
        callbackFn( cb );

    } );

    socket.on( "update log in", ( r, callbackFn ) =>{

        if( logIn?.length >= 2000 ){

            logIn = [];
            socket.broadcast.emit( "clear log in", [] );

        }

        r.id = logIn.length;
        logIn.push( r );

        callbackFn( socket.broadcast.emit( "updated log in", r ) );
        
    } );

    socket.on( "update log out", ( r, callbackFn ) =>{

        if( logOut?.length >= 2000 ){

            logOut = [];
            socket.broadcast.emit( "clear log out", [] );

        }

        r.id = logOut.length;
        logOut.push( r );

        callbackFn( socket.broadcast.emit( "updated log out", r ) );

    } );


} );

server.listen( port, () => console.log( `Server listening on port ${port}` ) );