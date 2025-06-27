module.exports = {
    PASSWORD_SALT_ROUND: 6,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRY: process.env.JWT_EXPIRY,
    CLIENT_ID: process.env.CLIENT_ID,
    BASE_URL: process.env.BASE_URL,
    FILE_SYSTEM: process.env.FILE_SYSTEM,

    MAIL_SYSTEM: process.env.MAIL_SYSTEM,
    MAIL_API_KEY: process.env.MAIL_API_KEY,
    MAIL_HOST: process.env.MAIL_HOST,
    MAIL_PORT: process.env.MAIL_PORT,
    MAIL_EMAIL: process.env.MAIL_EMAIL,
    MAIL_PASSWORD: process.env.MAIL_PASSWORD,
    MAIL_FROM: process.env.MAIL_FROM,
    EMAIL_VERIFICATION: 1,

    SMS_VERIFICATION: 0,

    PAGINATION_LIMIT: 20,
    LOOKUPS_ID: "de6683e5-9241-4ffc-9bf6-06d4cc614c37",
    STATIC_PAGE_ID: "c19c2f29-8e79-471c-b01d-e88d806bc0a7",

    USER_UPLOAD_DIRECTORY: 'user',

    NOTIFICATION_DRIVER: process.env.NOTIFICATION_DRIVER,
    SERVICE_ACCOUNT: {
        "type": "service_account",
        "project_id": "mundotango-test",
        "private_key_id": "035699aded823897a896cac2f004129ed735f0e8",
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDcpVVFqq2mOPDp\n+7GXm0VDVco0gKuQU/Ek6bX4cgIu7CYeTseEqez3OKpncfJm8rTqK/Mo6tvWifwV\nGQW7NFBQXCMzlmjKjBfvnmFszOVAvJT7+GkyN/MHGnBeLOb8FY3z2rjSxEOPSxgN\nvL2HSjrhGtOU3zSIzkAXVArAx1uBNcVyRdnDdThQBTKSmQQ8UV6hXHipUdnFZezd\nPdG18NFqvigIraWcts8VCk23jxBbYqQ+c1smvy8CGk6bSGUoyMfhXNjqOcYsgJPx\ncRXHMJmCWIO5iDJKjgnzqbHeA/zlxSR+wYLMDpHpbTPOBzOUkJwN1heVRoaOMR/r\n6nrhwcE7AgMBAAECggEAIMe9Xe7IAqh1/kUi8sOiLClMM7WkB3q5GkNQghsqAN+b\noCgTEz4NkwMLqfevTCUlxJ6H7x3JUFvKpDXF+LSCdBXkMu9XHTRn//T3Q2tDafU6\nax7SPiA6zmTaqdsg6/Wl08M8by+yW9ELv0q5m6ZnDfdm1Li+fM6rjeux90cG7LCS\nR/YD9Oo9Ojq9lay3ia/oQWj36Yi6/E2qsnQ6iebAOJ+FjKS6QjBoFxaZUvyrgzEa\nIazChRgI+FjRAaQY9Lw1jymuQEqivjULjPnytko3lNir0aJVPkTfzD59GNldxWRo\nlv8NrxdDwV6Lf8O/bXkmPM0nOShEhcTXh/NMMVE0CQKBgQDwP0mJVTCI8dE6IDGP\nYcQNIOsfMZUPpwC6t8Fb9g2hYXe97SnsrI8EzsdD7I6DwrC1s8o0pQfFxRywgwop\nAoewcKjINQCnfRVy2++8kTAWPk20s58vAEo1nr5JJkP0El12x9YbbLUc7k1jVwD8\n2+Sxl6AZTOqtdUsVuc/jApALIwKBgQDrHQX3P1E8cWJr8LhT29eBSzGli8F0u19f\nPEVWVuElj9XWVmc13uBv7rcIBBWBLQXgUrZlmaQ3NMRDfaN8bTbXv8/pX+SMUTeF\n1mcM+1g3QGg8YUlx6hiMuFn5eiWj0K3QrF9S9ycBTVw9GUVPu7F1RqZrtIcU869G\n82MKEll/CQKBgQDMoFr2CgVI3w6iP4F26oKd3Afnjce0iT3py1F6Dl0Vs3rV3gbz\nexZltemrRPUt7MmuOfBkXpv8KyOAhFxHCcygz5Qy0lI4ViXKquHK7q7Sg0aUPtm6\noriSax8QFvOSE4JgBV2sBi9M8PwhPJ2uwWxMhyTp58WK8Hh/jMAwTqJ5mQKBgALM\nWaHTsxfREabPOqJk32++gVzDCQ5mnH/5q6mXZx6XU6g1Zw0RFgK/CJaj1c2vx34f\n/eO/rGCr1BopiKSWeCyhL8xLQ+EXpl2Fa7yP0UD3F0aAsesVKi2ilA+QEJqehTMS\nmh/WqTQuw4ZGoriMN1R5/skRYPoy3Ecv5mHcTgxhAoGBAN1dSF4xhbg7WQW45Ioe\n3b1PNCtyr9CSrVjENfqRbxgUJF+Few1jrP9XqiTNYdlrxeJtKGMTymKJ8QZaGpG2\nTr02fs0eMIO6Wvguo+dFT7v12CD69oYP/4PFTyKlgKOkciUskQ6YBv+ezKmk41Fh\nDV3nqBaVdk4Ztytv10dAyfPm\n-----END PRIVATE KEY-----\n",
        "client_email": "firebase-adminsdk-nhyaw@mundotango-test.iam.gserviceaccount.com",
        "client_id": "110064650263731416892",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-nhyaw%40mundotango-test.iam.gserviceaccount.com",
        "universe_domain": "googleapis.com"
    }

}