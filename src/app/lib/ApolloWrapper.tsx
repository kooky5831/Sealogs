'use client'
// ^ this file needs the "use client" pragma
import { ApolloLink, HttpLink } from '@apollo/client'
import {
    ApolloNextAppProvider,
    NextSSRInMemoryCache,
    NextSSRApolloClient,
    SSRMultipartLink,
} from '@apollo/experimental-nextjs-app-support/ssr'
import { setContext } from '@apollo/client/link/context'
import { UpdateAuth } from './UpdateAuth'
import { persistCache, LocalStorageWrapper } from 'apollo3-cache-persist'

declare module '@apollo/client' {
    export interface DefaultContext {
        token?: string
    }
}

const cache = new NextSSRInMemoryCache({
    typePolicies: {
        Query: {
            fields: {
                readLogBookEntries: {
                    read(existing, { args, toReference }) {
                        return (
                            existing ||
                            toReference({
                                __typename: 'LogBookEntry',
                                id: args?.id,
                            })
                        )
                    },
                },
                readSeaLogsMember: {
                    read(existing, { args, toReference }) {
                        return (
                            existing ||
                            toReference({
                                __typename: 'SeaLogsMember',
                                id: args?.id,
                            })
                        )
                    },
                },
                readCrewMembers_LogBookEntrySections: {
                    read(existing, { args, toReference }) {
                        return (
                            existing ||
                            toReference({
                                __typename: 'CrewMembers_LogBookEntrySection',
                                id: args?.id,
                            })
                        )
                    },
                },
            },
        },
    },
})
// await before instantiating ApolloClient, else queries might run before the cache is persisted
async function initializePersistCache() {
    await persistCache({
        cache,
        storage: new LocalStorageWrapper(window.localStorage),
        trigger: 'write',
        debug: false,
    })
}

if (typeof window !== 'undefined') {
    initializePersistCache()
}
function makeClient() {
    const authLink = setContext(async (_, { headers, token }) => {
        return {
            headers: {
                ...headers,
                ...(token ? { authorization: `Bearer ${token}` } : {}),
            },
        }
    })
    // authLink.concat(new HttpLink({ uri: process.env.GRAPHQL_API_ENDPOINT }))
    return new NextSSRApolloClient({
        cache: cache,
        // link: authLink.concat(
        //     new HttpLink({ uri: process.env.GRAPHQL_API_ENDPOINT }),
        // ),
        link:
            typeof window === 'undefined'
                ? ApolloLink.from([
                      new SSRMultipartLink({
                          stripDefer: true,
                      }),
                      authLink.concat(
                          new HttpLink({
                              uri: process.env.GRAPHQL_API_ENDPOINT,
                          }),
                      ),
                  ])
                : authLink.concat(
                      new HttpLink({ uri: process.env.GRAPHQL_API_ENDPOINT }),
                  ),
        connectToDevTools: true,
    })
}

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
    return (
        <ApolloNextAppProvider makeClient={makeClient}>
            <UpdateAuth>{children}</UpdateAuth>
        </ApolloNextAppProvider>
    )
}
