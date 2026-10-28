// Rounds down so a server is only shown as 100% if it was never seen offline.
export const formatUptime = (uptime: number): string =>
    `${(Math.floor(uptime * 10) / 10).toLocaleString("en-US", { maximumFractionDigits: 1 })}%`;
