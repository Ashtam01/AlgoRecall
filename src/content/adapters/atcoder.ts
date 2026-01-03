import { SiteAdapter } from "./base";

export class AtCoderAdapter extends SiteAdapter {
  name = "atcoder";

  matchUrl(url: string): boolean {
    // Matches problem page AND submission details page
    return url.includes("atcoder.jp/contests/") && (url.includes("/tasks/") || url.includes("/submissions/"));
  }

  getProblemTitle(): string | null {
    // On Problem Page: Title is in h2
    // On Submission Page: We might need to look at the table row
    const titleEl = document.querySelector("span.h2");
    if (titleEl) {
        // Format is often "A - Problem Name"
        return titleEl.textContent?.trim().split('-')[1]?.trim() || titleEl.textContent?.trim() || "AtCoder Problem";
    }
    return "AtCoder Problem";
  }

  getProblemTags(): string[] {
    // AtCoder doesn't show tags natively without plugins, return empty
    return [];
  }

  isSuccessState(): boolean {
    // AtCoder shows partial AC during judging - we need to wait for FINAL verdict
    
    // 1. Check if still judging (WJ = Waiting for Judge)
    const waitingLabel = document.querySelector(".label-warning");
    if (waitingLabel && (waitingLabel.textContent?.includes("WJ") || waitingLabel.textContent?.includes("Judging"))) {
      return false; // Still judging, don't show popup yet
    }

    // 2. Check for any pending/running status indicators
    const statusText = document.body.innerText;
    if (statusText.includes("WJ") || statusText.includes("Judging")) {
      return false; // Still judging
    }

    // 3. On submission details page (/submissions/XXXXX), check for final AC verdict
    if (window.location.href.includes("/submissions/")) {
      // The submission status row shows the final verdict
      const submissionStatus = document.querySelector("#judge-status, td.text-center > span.label-success");
      if (submissionStatus && submissionStatus.textContent?.trim() === "AC") {
        return true;
      }
    }

    // 4. Check the submission result table for a confirmed AC (not partial)
    // Final verdict appears in the main status, not just test case results
    const resultTable = document.querySelector("table.table");
    if (resultTable) {
      const statusCell = resultTable.querySelector("td span.label-success");
      // Make sure it's the final status (AC), not a test case
      if (statusCell && statusCell.textContent?.trim() === "AC") {
        // Verify judging is complete by checking there's no WJ/pending anywhere
        const allLabels = document.querySelectorAll(".label-warning, .label-default");
        const stillPending = Array.from(allLabels).some(el => 
          el.textContent?.includes("WJ") || el.textContent?.includes("Judging")
        );
        if (!stillPending) return true;
      }
    }

    return false;
  }
}