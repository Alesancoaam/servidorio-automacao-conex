const { isEmpty } = require( "lodash" );

module.exports = ( socket, next ) =>{

    try{

        if( !isEmpty( socket.handshake.auth ) ){

            let token = socket.handshake.auth.token;

            if( token === process.env.TOKEN ){

                next();

            } else throw new Error( "Token inválida" );

        } else throw new Error( "Nenhuma token fornecida" );

    } catch( e ){

        next( new Error( e.message ) );

    } 

};