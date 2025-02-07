import NodeCache from "node-cache";

const cache = new NodeCache();

cache.set(1, "foo");
cache.set(1, "bar");
