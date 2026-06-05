#!/usr/bin/env bash
set -euo pipefail

existing=$(glab label list --output json | jq -r '.[].name')

create_if_missing() {
  local name="$1" color="$2" desc="$3"
  if echo "$existing" | grep -qxF "$name"; then
    echo "  skip     $name"
  else
    glab label create "$name" --color "$color" --description "$desc"
    echo "  created  $name"
  fi
}

echo "workflow::* labels"
create_if_missing "workflow::ready"     "#428BCA" "Issue defined, ready to be picked up"
create_if_missing "workflow::in dev"    "#F0AD4E" "Actively being worked on"
create_if_missing "workflow::in review" "#5CB85C" "MR open, waiting for merge"
create_if_missing "workflow::complete"  "#5BC0DE" "Done, issue closed"

echo "type::* labels"
create_if_missing "type::bug"            "#D9534F" "Defect or regression"
create_if_missing "type::feature"        "#5CB85C" "New functionality"
create_if_missing "type::technical-debt" "#F0AD4E" "Refactoring or internal improvement"
create_if_missing "type::documentation"  "#428BCA" "Docs update"

echo "kind::* labels"
create_if_missing "kind::epic"  "#6F42C1" "Parent epic grouping multiple stories"
create_if_missing "kind::story" "#9B59B6" "User story under an epic"
