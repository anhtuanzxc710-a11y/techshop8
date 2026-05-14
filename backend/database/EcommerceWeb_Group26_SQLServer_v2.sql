/*
===========================================================
 DATABASE: EcommerceWeb_Group26
 VERSION : 2.0 (FINAL NORMALIZED SCHEMA)
 TARGET   : Microsoft SQL Server
 PURPOSE  : Full mapping of existing Node.js/React E-commerce
            business logic into relational tables.
===========================================================
*/

IF DB_ID('EcommerceWeb_Group26') IS NULL
BEGIN
    CREATE DATABASE EcommerceWeb_Group26;
END
GO

USE EcommerceWeb_Group26;
GO

-- =========================================================
-- DROP EXISTING TABLES IN REVERSE DEPENDENCY ORDER
-- =========================================================
IF OBJECT_ID('dbo.UserVoucherUsage', 'U') IS NOT NULL DROP TABLE dbo.UserVoucherUsage;
IF OBJECT_ID('dbo.PaymentTransaction', 'U') IS NOT NULL DROP TABLE dbo.PaymentTransaction;
IF OBJECT_ID('dbo.Notification', 'U') IS NOT NULL DROP TABLE dbo.Notification;
IF OBJECT_ID('dbo.Reply', 'U') IS NOT NULL DROP TABLE dbo.Reply;
IF OBJECT_ID('dbo.Comment', 'U') IS NOT NULL DROP TABLE dbo.Comment;
IF OBJECT_ID('dbo.OrderItem', 'U') IS NOT NULL DROP TABLE dbo.OrderItem;
IF OBJECT_ID('dbo.[Order]', 'U') IS NOT NULL DROP TABLE dbo.[Order];
IF OBJECT_ID('dbo.ConversationMessage', 'U') IS NOT NULL DROP TABLE dbo.ConversationMessage;
IF OBJECT_ID('dbo.Conversation', 'U') IS NOT NULL DROP TABLE dbo.Conversation;
IF OBJECT_ID('dbo.ProductImage', 'U') IS NOT NULL DROP TABLE dbo.ProductImage;
IF OBJECT_ID('dbo.ProductSpecification', 'U') IS NOT NULL DROP TABLE dbo.ProductSpecification;
IF OBJECT_ID('dbo.Product', 'U') IS NOT NULL DROP TABLE dbo.Product;
IF OBJECT_ID('dbo.Voucher', 'U') IS NOT NULL DROP TABLE dbo.Voucher;
IF OBJECT_ID('dbo.UserVerification', 'U') IS NOT NULL DROP TABLE dbo.UserVerification;
IF OBJECT_ID('dbo.PasswordReset', 'U') IS NOT NULL DROP TABLE dbo.PasswordReset;
IF OBJECT_ID('dbo.[User]', 'U') IS NOT NULL DROP TABLE dbo.[User];
GO

-- =========================================================
-- AUTH & USER MANAGEMENT
-- =========================================================
CREATE TABLE dbo.[User]
(
    UserID              INT IDENTITY(1,1) PRIMARY KEY,
    FullName            NVARCHAR(150) NOT NULL,
    Email               NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash        NVARCHAR(255) NOT NULL,
    ProfileImage        NVARCHAR(MAX) NULL,
    
    -- New Profile fields mapped from frontend logic
    Phone               NVARCHAR(20) NULL,
    Address             NVARCHAR(500) NULL,
    DOB                 DATE NULL,
    Gender              NVARCHAR(10) NULL,

    RoleName            NVARCHAR(20) NOT NULL DEFAULT 'Customer',
    IsActive            BIT NOT NULL DEFAULT 1,
    IsDeleted           BIT NOT NULL DEFAULT 0, -- Soft delete

    CreatedAt           DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt           DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT CK_User_Role CHECK (RoleName IN ('Customer', 'Admin')),
    CONSTRAINT CK_User_Gender CHECK (Gender IN ('Male', 'Female', 'Other'))
);
GO

-- Memory arrays moved to relational tables for JWT Verification
CREATE TABLE dbo.UserVerification
(
    VerificationID      INT IDENTITY(1,1) PRIMARY KEY,
    Email               NVARCHAR(255) NOT NULL,
    PasswordHash        NVARCHAR(255) NOT NULL, -- Temporary storage before creating user
    Token               NVARCHAR(500) NOT NULL,
    ExpiresAt           DATETIME2 NOT NULL,
    CreatedAt           DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

CREATE TABLE dbo.PasswordReset
(
    ResetID             INT IDENTITY(1,1) PRIMARY KEY,
    Email               NVARCHAR(255) NOT NULL,
    Token               NVARCHAR(500) NOT NULL,
    ExpiresAt           DATETIME2 NOT NULL,
    CreatedAt           DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

-- =========================================================
-- PRODUCT CATALOG
-- =========================================================
CREATE TABLE dbo.Product
(
    ProductID           INT IDENTITY(1,1) PRIMARY KEY,
    ProductName         NVARCHAR(255) NOT NULL,
    Brand               NVARCHAR(100) NOT NULL,
    Category            NVARCHAR(100) NOT NULL,
    Description         NVARCHAR(MAX) NULL, -- Added missing description

    Price               DECIMAL(18,2) NOT NULL DEFAULT 0,
    StockQuantity       INT NOT NULL DEFAULT 0,
    Rating              DECIMAL(3,2) NULL,

    IsAvailable         BIT NOT NULL DEFAULT 1,
    IsBestSeller        BIT NOT NULL DEFAULT 0,
    IsDeleted           BIT NOT NULL DEFAULT 0, -- Soft delete

    ReleaseDate         DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    ImageURL            NVARCHAR(MAX) NULL, -- Main Thumbnail

    CreatedAt           DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt           DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT CK_Product_Price CHECK (Price >= 0),
    CONSTRAINT CK_Product_Stock CHECK (StockQuantity >= 0),
    CONSTRAINT CK_Product_Rating CHECK (Rating BETWEEN 0 AND 5)
);
GO

-- Explicit mapping for multiple images (if scaled up from just ImageURL)
CREATE TABLE dbo.ProductImage
(
    ImageID             INT IDENTITY(1,1) PRIMARY KEY,
    ProductID           INT NOT NULL,
    ImageURL            NVARCHAR(MAX) NOT NULL,
    IsPrimary           BIT NOT NULL DEFAULT 0,
    
    CONSTRAINT FK_ProductImage_Product FOREIGN KEY (ProductID) 
        REFERENCES dbo.Product(ProductID) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.ProductSpecification
(
    SpecificationID     INT IDENTITY(1,1) PRIMARY KEY,
    ProductID           INT NOT NULL,
    SpecKey             NVARCHAR(100) NOT NULL,
    SpecValue           NVARCHAR(500) NOT NULL,

    CONSTRAINT FK_ProductSpecification_Product FOREIGN KEY (ProductID) 
        REFERENCES dbo.Product(ProductID) ON DELETE CASCADE
);
GO

-- =========================================================
-- VOUCHERS
-- =========================================================
CREATE TABLE dbo.Voucher
(
    VoucherID           INT IDENTITY(1,1) PRIMARY KEY,
    VoucherCode         NVARCHAR(50) NOT NULL UNIQUE,
    Description         NVARCHAR(500) NOT NULL,
    DiscountType        NVARCHAR(20) NOT NULL DEFAULT 'fixed',
    DiscountValue       DECIMAL(18,2) NOT NULL,
    MinOrderAmount      DECIMAL(18,2) NOT NULL DEFAULT 0,
    MaxDiscountAmount   DECIMAL(18,2) NULL,
    ExpiryDate          DATETIME2 NOT NULL,
    UsageLimit          INT NOT NULL DEFAULT 100,
    UsedCount           INT NOT NULL DEFAULT 0,
    IsActive            BIT NOT NULL DEFAULT 1,
    CreatedAt           DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT CK_Voucher_DiscountType CHECK (DiscountType IN ('fixed', 'percentage')),
    CONSTRAINT CK_Voucher_DiscountValue CHECK (DiscountValue >= 0),
    CONSTRAINT CK_Voucher_Usage CHECK (UsedCount <= UsageLimit)
);
GO

CREATE TABLE dbo.UserVoucherUsage
(
    UsageID             INT IDENTITY(1,1) PRIMARY KEY,
    UserID              INT NOT NULL,
    VoucherID           INT NOT NULL,
    OrderID             INT NOT NULL, -- Tied to an order
    UsedAt              DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_UserVoucherUsage_User FOREIGN KEY (UserID) REFERENCES dbo.[User](UserID),
    CONSTRAINT FK_UserVoucherUsage_Voucher FOREIGN KEY (VoucherID) REFERENCES dbo.Voucher(VoucherID),
    CONSTRAINT UQ_User_Voucher UNIQUE(UserID, VoucherID) -- Prevent multiple uses by same user
);
GO

-- =========================================================
-- SHOPPING & ORDERS
-- =========================================================
CREATE TABLE dbo.[Order]
(
    OrderID                 INT IDENTITY(1,1) PRIMARY KEY,
    UserID                  INT NOT NULL,
    VoucherID               INT NULL,

    TotalItems              INT NOT NULL DEFAULT 1,
    SubTotalAmount          DECIMAL(18,2) NOT NULL,
    DiscountAmount          DECIMAL(18,2) NOT NULL DEFAULT 0,
    TotalAmount             DECIMAL(18,2) NOT NULL,

    OrderStatus             NVARCHAR(20) NOT NULL DEFAULT 'processing',
    PaymentMethod           NVARCHAR(50) NOT NULL DEFAULT 'Cash',
    PaymentStatus           BIT NOT NULL DEFAULT 0,

    ShippingAddress         NVARCHAR(500) NOT NULL,
    DeliveryDate            DATETIME2 NULL,

    CreatedAt               DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt               DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_Order_User FOREIGN KEY (UserID) REFERENCES dbo.[User](UserID),
    CONSTRAINT FK_Order_Voucher FOREIGN KEY (VoucherID) REFERENCES dbo.Voucher(VoucherID),
    CONSTRAINT CK_Order_Status CHECK (OrderStatus IN ('processing', 'shipped', 'cancelled'))
);
GO

CREATE TABLE dbo.OrderItem
(
    OrderItemID             INT IDENTITY(1,1) PRIMARY KEY,
    OrderID                 INT NOT NULL,
    ProductID               INT NOT NULL,
    Quantity                INT NOT NULL DEFAULT 1,
    UnitPrice               DECIMAL(18,2) NOT NULL,
    LineTotal               AS (Quantity * UnitPrice) PERSISTED,

    CONSTRAINT FK_OrderItem_Order FOREIGN KEY (OrderID) REFERENCES dbo.[Order](OrderID) ON DELETE CASCADE,
    CONSTRAINT FK_OrderItem_Product FOREIGN KEY (ProductID) REFERENCES dbo.Product(ProductID),
    CONSTRAINT CK_OrderItem_Quantity CHECK (Quantity > 0)
);
GO

-- =========================================================
-- PAYMENT SYSTEM
-- =========================================================
CREATE TABLE dbo.PaymentTransaction
(
    TransactionID           INT IDENTITY(1,1) PRIMARY KEY,
    OrderID                 INT NOT NULL UNIQUE, -- 1-to-1 with Order
    PaymentProvider         NVARCHAR(50) NOT NULL, -- e.g., 'ZaloPay', 'Cash'
    ProviderTransactionID   NVARCHAR(255) NULL, -- ID from ZaloPay
    Amount                  DECIMAL(18,2) NOT NULL,
    Status                  NVARCHAR(20) NOT NULL DEFAULT 'Pending',
    CallbackData            NVARCHAR(MAX) NULL, -- JSON dump of webhook
    CreatedAt               DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_Payment_Order FOREIGN KEY (OrderID) REFERENCES dbo.[Order](OrderID) ON DELETE CASCADE,
    CONSTRAINT CK_Payment_Status CHECK (Status IN ('Pending', 'Success', 'Failed', 'Refunded'))
);
GO

-- =========================================================
-- REVIEWS & COMMENTS
-- =========================================================
CREATE TABLE dbo.Comment
(
    CommentID               INT IDENTITY(1,1) PRIMARY KEY,
    UserID                  INT NOT NULL,
    ProductID               INT NOT NULL,
    OrderID                 INT NULL, -- Added OrderID
    Rating                  INT NULL,
    CommentText             NVARCHAR(MAX) NOT NULL,
    CreatedAt               DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt               DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_Comment_User FOREIGN KEY (UserID) REFERENCES dbo.[User](UserID) ON DELETE CASCADE,
    CONSTRAINT FK_Comment_Product FOREIGN KEY (ProductID) REFERENCES dbo.Product(ProductID) ON DELETE CASCADE,
    CONSTRAINT FK_Comment_Order FOREIGN KEY (OrderID) REFERENCES dbo.[Order](OrderID),
    CONSTRAINT CK_Comment_Rating CHECK (Rating BETWEEN 1 AND 5)
);
GO

CREATE TABLE dbo.Reply
(
    ReplyID                 INT IDENTITY(1,1) PRIMARY KEY,
    CommentID               INT NOT NULL,
    UserID                  INT NOT NULL, -- Who replied (Admin usually)
    ReplyText               NVARCHAR(MAX) NOT NULL,
    CreatedAt               DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_Reply_Comment FOREIGN KEY (CommentID) REFERENCES dbo.Comment(CommentID) ON DELETE CASCADE,
    CONSTRAINT FK_Reply_User FOREIGN KEY (UserID) REFERENCES dbo.[User](UserID)
);
GO

-- =========================================================
-- NOTIFICATIONS
-- =========================================================
CREATE TABLE dbo.Notification
(
    NotificationID          INT IDENTITY(1,1) PRIMARY KEY,
    UserID                  INT NOT NULL,
    NotificationText        NVARCHAR(1000) NOT NULL,
    IsRead                  BIT NOT NULL DEFAULT 0,
    CreatedAt               DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_Notification_User FOREIGN KEY (UserID) REFERENCES dbo.[User](UserID) ON DELETE CASCADE
);
GO

-- =========================================================
-- AI CHATBOT HISTORY
-- =========================================================
CREATE TABLE dbo.Conversation
(
    ConversationID          INT IDENTITY(1,1) PRIMARY KEY,
    UserID                  INT NOT NULL UNIQUE,
    CreatedAt               DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt               DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_Conversation_User FOREIGN KEY (UserID) REFERENCES dbo.[User](UserID) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.ConversationMessage
(
    MessageID               INT IDENTITY(1,1) PRIMARY KEY,
    ConversationID          INT NOT NULL,
    SenderType              NVARCHAR(20) NOT NULL,
    MessageContent          NVARCHAR(MAX) NOT NULL,
    CreatedAt               DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_ConversationMessage_Conversation FOREIGN KEY (ConversationID) REFERENCES dbo.Conversation(ConversationID) ON DELETE CASCADE,
    CONSTRAINT CK_ConversationMessage_Sender CHECK (SenderType IN ('user', 'assistant', 'system'))
);
GO

-- =========================================================
-- TRIGGERS & INDEXES
-- =========================================================
CREATE INDEX IX_Product_Category ON dbo.Product(Category);
CREATE INDEX IX_Product_Brand ON dbo.Product(Brand);
CREATE INDEX IX_Product_IsActive ON dbo.Product(IsAvailable, IsDeleted);
CREATE INDEX IX_Order_UserID ON dbo.[Order](UserID);
CREATE INDEX IX_Order_Status ON dbo.[Order](OrderStatus);
CREATE INDEX IX_Comment_ProductID ON dbo.Comment(ProductID);
CREATE INDEX IX_UserVoucher_Usage ON dbo.UserVoucherUsage(UserID, VoucherID);
GO

CREATE OR ALTER TRIGGER trg_Update_User ON dbo.[User] AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.[User] SET UpdatedAt = SYSDATETIME() WHERE UserID IN (SELECT UserID FROM inserted);
END;
GO

CREATE OR ALTER TRIGGER trg_Update_Product ON dbo.Product AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Product SET UpdatedAt = SYSDATETIME() WHERE ProductID IN (SELECT ProductID FROM inserted);
END;
GO

CREATE OR ALTER TRIGGER trg_Update_Order ON dbo.[Order] AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.[Order] SET UpdatedAt = SYSDATETIME() WHERE OrderID IN (SELECT OrderID FROM inserted);
END;
GO

-- =========================================================
-- SP: CREATE ORDER TRANSACTION (Updated for Usage)
-- =========================================================
CREATE OR ALTER PROCEDURE dbo.sp_CreateOrder
(
    @UserID                INT,
    @VoucherID             INT = NULL,
    @SubTotalAmount        DECIMAL(18,2),
    @DiscountAmount        DECIMAL(18,2),
    @TotalAmount           DECIMAL(18,2),
    @TotalItems            INT,
    @PaymentMethod         NVARCHAR(50),
    @ShippingAddress       NVARCHAR(500)
)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Create Order
        DECLARE @NewOrderID INT;
        INSERT INTO dbo.[Order] (UserID, VoucherID, TotalItems, SubTotalAmount, DiscountAmount, TotalAmount, PaymentMethod, ShippingAddress)
        VALUES (@UserID, @VoucherID, @TotalItems, @SubTotalAmount, @DiscountAmount, @TotalAmount, @PaymentMethod, @ShippingAddress);
        SET @NewOrderID = SCOPE_IDENTITY();

        -- 2. Mark Voucher as Used by User
        IF @VoucherID IS NOT NULL
        BEGIN
            INSERT INTO dbo.UserVoucherUsage (UserID, VoucherID, OrderID)
            VALUES (@UserID, @VoucherID, @NewOrderID);
            
            UPDATE dbo.Voucher SET UsedCount = UsedCount + 1 WHERE VoucherID = @VoucherID;
        END

        COMMIT TRANSACTION;
        SELECT @NewOrderID AS NewOrderID;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO
