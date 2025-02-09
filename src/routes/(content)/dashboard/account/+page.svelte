<script lang="ts">
    import { Button } from "$lib/components/ui/button";
</script>

<h1 class="text-2xl font-bold">Account</h1>

<br />

<aside>
    <nav>
        <ul class="flex flex-col gap-2">
            <li>
                <Button variant="destructive" href="/logout/all/"
                    >Log out of All Devices</Button
                >
            </li>

            <li>
                <Button variant="destructive" href="./delete/"
                    >Delete Account</Button
                >
            </li>

            <li>
                <br /><br />
                <Button variant="outline" href="../">Go Back</Button>
            </li>
        </ul>
    </nav>
</aside>
