# Fish completion script for debateclub (run via npx)
# To use: source completions/debateclub.fish

# Check if the command is 'npx' and the next argument is 'debateclub'
function __fish_debateclub_needs_command
    set -l cmd (commandline -opc)
    if [ (count $cmd) -lt 2 ]
        return 1 # Not enough arguments yet
    end
    if [ $cmd[1] = "npx" ] && [ $cmd[2] = "debateclub" ]
        return 0 # It's our command
    end
    return 1
end

# --- Options ---

# Helper function for path completion
function __fish_complete_path
    set -l current_token (commandline -ct)
    # If token starts with ~ or /, complete absolute paths
    if string match -q -r '^(/|~)' -- $current_token
        __fish_complete_suffix (commandline -ct)
    else
        # Otherwise, complete relative paths
        __fish_complete_suffix (commandline -ct)
    end
end

# --source-dir / -s (Path)
complete -c debateclub -n '__fish_debateclub_needs_command' -s s -l source-dir -d 'Path to source markdown files' -r -f -a '(__fish_complete_path)'

# --supabase-url / -d (URL)
complete -c debateclub -n '__fish_debateclub_needs_command' -s d -l supabase-url -d 'URL to Supabase Postgrest API' -r

# --firecrawl-api-url (URL)
complete -c debateclub -n '__fish_debateclub_needs_command' -l firecrawl-api-url -d 'Firecrawl API URL' -r

# --ollama-base-url (URL)
complete -c debateclub -n '__fish_debateclub_needs_command' -l ollama-base-url -d 'Ollama API base URL' -r

# --ollama-model (Name)
complete -c debateclub -n '__fish_debateclub_needs_command' -l ollama-model -d 'Ollama model name' -r

# --concurrency (Number)
complete -c debateclub -n '__fish_debateclub_needs_command' -l concurrency -d 'Max concurrent crawls/summaries' -r

# --skip-extraction (Flag)
complete -c debateclub -n '__fish_debateclub_needs_command' -l skip-extraction -d 'Skip finding and adding new links'

# --skip-crawl (Flag)
complete -c debateclub -n '__fish_debateclub_needs_command' -l skip-crawl -d 'Skip crawling pending links'

# --skip-summary (Flag)
complete -c debateclub -n '__fish_debateclub_needs_command' -l skip-summary -d 'Skip summarizing crawled content'

# --reset-db (Flag)
complete -c debateclub -n '__fish_debateclub_needs_command' -l reset-db -d 'Delete and recreate the database'

# --help / -h (Flag)
complete -c debateclub -n '__fish_debateclub_needs_command' -s h -l help -d 'Display help message'