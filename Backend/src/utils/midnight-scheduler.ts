import { Container } from "typedi";
import { AutomatedSupplierDataService } from "@/services/supplierProduct/automated-supplier-data.service";
import cron from 'node-cron';

export class MidnightScheduler {
  private static isRunning: boolean = false;
  
  public static start(): void {
    // Run every day at midnight (00:00)
    cron.schedule('0 0 * * *', async () => {
      await this.executeMidnightUpdate();
    });

    // Also run on server startup (after 10 seconds to let everything initialize)
    setTimeout(() => {
      this.executeMidnightUpdate();
    }, 10000);

    console.log('✅ Midnight data update scheduler started');
    console.log('🕛 Next automated update: Daily at 00:00');
  }
  
  private static async executeMidnightUpdate(): Promise<void> {
    if (this.isRunning) {
      console.log('⏳ Midnight update already in progress, skipping...');
      return;
    }

    this.isRunning = true;
    
    try {
      console.log('🌙 Starting automated midnight data update...');
      
      const automatedDataService = Container.get(AutomatedSupplierDataService);
      const result = await automatedDataService.uploadAllData();
      
      if (result.success) {
        console.log(`✅ Midnight update completed successfully!`);
        console.log(`   Total products: ${result.total}`);
        console.log(`   Timestamp: ${result.timestamp}`);
      } else {
        console.log(`⚠️  Midnight update completed with issues`);
        console.log(`   Amrod: ${result.amrod.message}`);
        console.log(`   Parrot: ${result.parrot.message}`);
        console.log(`   Tarsus: ${result.tarsus.message}`);
      }
      
    } catch (error) {
      console.error('❌ Midnight update failed:', error);
    } finally {
      this.isRunning = false;
    }
  }

  public static getStatus(): { running: boolean } {
    return { running: this.isRunning };
  }
}