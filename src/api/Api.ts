import axios from "axios";

export interface quote {
    _id: string;
    author: string;
    authorSlug: string;
    content: string;
    dateAdded: string;
    dateModified: string;
    length: number;
    tags: string[];
}

export interface result {
    count: string;
    lastItemIndex: string;
    page: string;
    results: quote[];
    totalCount: string;
    totalPages: string;
}

export default class Api {

    private static readonly URL = 'https://api.quotable.io/';

    constructor() {};


    /**
     * Returns a Promise with a random quote.
     */
    static async getRandomQuote() {
        return new Promise<quote>(async (res, rej) => {
            await axios.get(`${this.URL}random`)
                .then((response) => {
                    return res(response.data as quote);
                })
                .catch((error) => {
                    return rej(new Error('Error retrieving the quote'));
                });
        })
    }

    /**
     * Returns a list with quotes containing the provided tags.
     * @param tags List of tags to search for.
     * @param and Whether to use 'and' or 'or' conjunction when searching for quotes with tags. 
     * @returns Promise<result>
     */
    static async getQuoteWithTags(tags: string[], and: boolean = false) {  
        const query = tags.join(and ? ',' : '|');

        return new Promise<result>(async (res, rej) => {
            await axios.get(`${this.URL}quotes?tags=${query}`)
                .then((response) => {
                    return res(response.data as result);
                })
                .catch((error) => {
                    return rej(new Error('Error retrieving the result'));
                });
        })
    }

    /**
     * 
     */
    static async getMovieQuote() {
        const options = {
            method: 'GET',
            url: 'https://andruxnet-random-famous-quotes.p.rapidapi.com/',
            params: {
                count: '10',
                cat: 'movies'
            },
            headers: {
                'X-RapidAPI-Key': 'b14117b60fmsh47b99009e52123cp181b28jsne1b3b5527503',
                'X-RapidAPI-Host': 'andruxnet-random-famous-quotes.p.rapidapi.com'
            }
        };

        try {
            const response = await axios.request(options);
            console.log(response.data);
        } catch (error) {
            console.error(error);
        }
    }
}

