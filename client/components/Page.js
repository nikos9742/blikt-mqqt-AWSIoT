import React from 'react'
import Head from 'next/head'

export default ({ children }) => (
    <div className="out">
        <div className="in">
            {children}
        </div>
        <Head>
            <link
                rel="stylesheet"
                href="https://unpkg.com/purecss@0.6.2/build/pure-min.css"
                integrity="sha384-UQiGfs9ICog+LwheBSRCt1o5cbyKIHbwjWscjemyBMT9YCUMZffs6UqUTd0hObXD"
                crossorigin="anonymous"
            />
        </Head>
        <style>{`
            html {
                background-color: #222;
                background-image: linear-gradient(30deg, #444, transparent);
                color: #DDD;
            }
        `}</style>
        <style jsx>{`
            .out {
                display: flex;
                justify-content: center;
                padding: 10vmin 0;
            }

            .in {
                flex: 0 1 42em;
            }
        `}</style>
    </div>
)