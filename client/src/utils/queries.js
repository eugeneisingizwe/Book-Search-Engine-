import {gql} from "@apollo/client";


export const Query_GET_ME =gql `
query me{
    me {
        _id
        username
        email
        bookCount
        savedBook{
            authors
            description
            bookId
            image
            link
            title
        }
    }
}

`
;
