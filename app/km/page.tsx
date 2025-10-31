'use client'
import { useState } from "react";
export default function Km() {
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Km Travelled</h1>
            </div>

            <table className="w-full min-w-[800px]">
                <thead>
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                            Vehicle Number
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                            Type
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                            Amount
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                            Description
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                            Date
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                            Status
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {/* Loading indicator row */}
                    {isLoadingMore && (
                        <tr>
                            <td colSpan={6} className="py-4 text-center text-gray-500">Loading more…</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}