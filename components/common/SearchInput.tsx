import React, {memo, useEffect} from "react";
import {Search} from "lucide-react";
import {Label} from "@radix-ui/react-label";
import {Input} from "../ui/input";

export const SearchInput = memo(
    ({
         searchTerm,
         setSearchTerm,
         debouncedSearchTerm,
     }: {
        searchTerm: string
        setSearchTerm: (value: string) => void
        debouncedSearchTerm: string
    }) => {
        useEffect(() => {
            const input = document.getElementById('user-search-input')
            if (input) {
                input.focus()
            }
        }, [debouncedSearchTerm])

        return (
            <div className="col-span-2">
                <Label className="text-slate-300 mb-2 block font-light">Search Users</Label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400"/>
                    <Input
                        id="user-search-input"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        autoComplete="name"
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-300"
                    />
                </div>
            </div>
        )
    }
)
SearchInput.displayName = 'SearchInput'
