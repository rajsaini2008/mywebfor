import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import mongoose from "mongoose"

export async function GET() {
  try {
    await connectToDatabase()
    
    console.log("Starting database percentage type fix operation");
    
    // Fix the percentage field on all exam applications that have it
    // This converts any existing percentage to a number type
    const examApplicationsCollection = mongoose.connection.db.collection('examapplications');
    
    // First, find all records with percentage
    const recordsWithPercentage = await examApplicationsCollection.find(
      { percentage: { $exists: true } }
    ).toArray();
    
    console.log(`Found ${recordsWithPercentage.length} records with percentage field`);
    
    // Log some examples
    if (recordsWithPercentage.length > 0) {
      console.log("Sample records before update:");
      recordsWithPercentage.slice(0, 3).forEach(record => {
        console.log(`ID: ${record._id}, Percentage: ${record.percentage}, Type: ${typeof record.percentage}`);
      });
    }
    
    // Update all records to ensure percentage is a number
    let updatedCount = 0;
    for (const record of recordsWithPercentage) {
      const numericPercentage = Number(record.percentage);
      if (!isNaN(numericPercentage)) {
        const result = await examApplicationsCollection.updateOne(
          { _id: record._id },
          { $set: { percentage: numericPercentage } }
        );
        if (result.modifiedCount > 0) {
          updatedCount++;
        }
      }
    }
    
    console.log(`Updated ${updatedCount} records to ensure percentage is a number`);
    
    // Verify the fix
    const verifyRecords = await examApplicationsCollection.find(
      { percentage: { $exists: true } }
    ).limit(3).toArray();
    
    console.log("Sample records after update:");
    verifyRecords.forEach(record => {
      console.log(`ID: ${record._id}, Percentage: ${record.percentage}, Type: ${typeof record.percentage}`);
    });
    
    return NextResponse.json({
      success: true,
      message: `Updated ${updatedCount} records to ensure percentage is a number`,
      samplesAfterUpdate: verifyRecords.map(r => ({ 
        id: r._id.toString(), 
        percentage: r.percentage,
        type: typeof r.percentage
      }))
    });
    
  } catch (error) {
    console.error("Error fixing percentage values:", error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while fixing percentage values",
      error: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 